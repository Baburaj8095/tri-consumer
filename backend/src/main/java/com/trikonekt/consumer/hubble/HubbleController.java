package com.trikonekt.consumer.hubble;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trikonekt.consumer.auth.DjangoAuthClient;
import com.trikonekt.consumer.auth.HashingService;
import com.trikonekt.consumer.auth.SessionRepository;
import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.common.BusinessException;
import com.trikonekt.consumer.hubble.dto.HubbleIframeResponse;
import com.trikonekt.consumer.hubble.dto.HubbleTransactionDto;
import com.trikonekt.consumer.user.User;
import com.trikonekt.consumer.user.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Hubble Gift Cards SDK endpoints — Java re-implementation of Django's:
 *
 *   GET  /api/business/hubble/iframe-url/        → HubbleIframeUrlView
 *   GET  /api/business/hubble/transactions/me/   → HubbleTransactionsMeView
 *   POST /api/hubble/webhook/                    → HubbleWebhookReceiverView
 *
 * All endpoints are under /api/hubble/ in the Java service.
 * Authentication: consumer endpoints use Bearer session token (same as other Java API endpoints).
 * Webhook: public, verified by X-Verify HMAC-SHA256.
 */
@RestController
@RequestMapping("/api/hubble")
public class HubbleController {

  private static final Logger log = LoggerFactory.getLogger(HubbleController.class);

  private final HubbleConfig config;
  private final HubbleJwtService jwtService;
  private final HubbleWebhookService webhookService;
  private final HubbleRepository hubbleRepository;
  private final SessionRepository sessionRepository;
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;
  private final HashingService hashingService;
  private final DjangoAuthClient djangoAuthClient;

  public HubbleController(HubbleConfig config, HubbleJwtService jwtService,
                           HubbleWebhookService webhookService, HubbleRepository hubbleRepository,
                           SessionRepository sessionRepository, UserRepository userRepository,
                           ObjectMapper objectMapper,
                           HashingService hashingService,
                           DjangoAuthClient djangoAuthClient) {
    this.config = config;
    this.jwtService = jwtService;
    this.webhookService = webhookService;
    this.hubbleRepository = hubbleRepository;
    this.sessionRepository = sessionRepository;
    this.userRepository = userRepository;
    this.objectMapper = objectMapper;
    this.hashingService = hashingService;
    this.djangoAuthClient = djangoAuthClient;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/hubble/iframe-url
  // Mirrors: Django HubbleIframeUrlView (business/views.py:87)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Generate a short-lived (60s) Hubble SDK iframe URL for the authenticated consumer.
   *
   * Response: { "success": true, "data": { "iframeUrl": "...", "expiresIn": 60 } }
   *
   * Requires: Authorization: Bearer <session_token>
   */
  @GetMapping("/iframe-url")
  public ResponseEntity<ApiResponse<HubbleIframeResponse>> getIframeUrl(
      @RequestHeader(value = "Authorization", required = false) String authHeader) {

    if (!config.isConfigured()) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(ApiResponse.fail("Hubble is not configured on this server. Required: " +
              "app.hubble.client-id, app.hubble.jwt-private-key-pem, app.hubble.sdk-base-url"));
    }

    User user = resolveUserFromBearerToken(authHeader);

    try {
      // Build SSO JWT — mirrors Django's generate_hubble_sso_jwt(subject=str(user.id), ...)
      String ssoToken = jwtService.generateSsoToken(
          String.valueOf(user.id()),
          user.fullName() != null ? user.fullName() : "",
          user.email() != null ? user.email() : "",
          digitsOnly(user.mobile()),           // phone digits only (e.g. "919876543210")
          List.of("consumer")
      );

      String iframeUrl = jwtService.buildIframeUrl(ssoToken);
      return ResponseEntity.ok(ApiResponse.ok("Hubble iframe URL generated",
          new HubbleIframeResponse(iframeUrl, 60)));

    } catch (IllegalStateException e) {
      log.error("Hubble config error: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(ApiResponse.fail("Hubble configuration error: " + e.getMessage()));
    } catch (Exception e) {
      log.error("Hubble iframe URL generation failed", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.fail("Failed to generate Hubble iframe URL"));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/hubble/transactions/me
  // Mirrors: Django HubbleTransactionsMeView (business/views.py:138)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * List the authenticated consumer's Hubble gift card transactions.
   *
   * Query params:
   *   limit  (int, 1–200, default 50)
   *
   * Requires: Authorization: Bearer <session_token>
   */
  @GetMapping("/transactions/me")
  public ResponseEntity<ApiResponse<List<HubbleTransactionDto>>> getMyTransactions(
      @RequestHeader(value = "Authorization", required = false) String authHeader,
      @RequestParam(defaultValue = "50") int limit) {

    User user = resolveUserFromBearerToken(authHeader);
    int safeLimit = Math.max(1, Math.min(200, limit));

    List<HubbleTransactionDto> transactions =
        hubbleRepository.findTransactionsByUserId(user.id(), safeLimit);

    return ResponseEntity.ok(ApiResponse.ok("Transactions fetched", transactions));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/hubble/webhook
  // Mirrors: Django HubbleWebhookReceiverView (business/views.py:180)
  //
  // Also registered at:
  //   POST /api/hubble/webhook/transaction-status
  //   POST /api/hubble/webhook/brand-updated
  //   POST /api/hubble/webhook/partner-discount
  // (All route to the same handler — payload contains event discriminator)
  // ─────────────────────────────────────────────────────────────────────────

  @PostMapping({"/webhook", "/webhook/transaction-status",
                "/webhook/brand-updated", "/webhook/partner-discount"})
  public ResponseEntity<ApiResponse<Object>> receiveWebhook(
      HttpServletRequest request,
      @RequestHeader(value = "X-Verify", required = false) String xVerify) {

    // 1. Optional IP allowlist (mirrors Django's _is_ip_allowed)
    String clientIp = extractClientIp(request);
    if (!webhookService.isIpAllowed(clientIp)) {
      log.warn("Hubble webhook blocked: IP {} not in allowlist", clientIp);
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(ApiResponse.fail("Forbidden"));
    }

    // 2. Read raw body
    byte[] rawBody;
    try {
      rawBody = request.getInputStream().readAllBytes();
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(ApiResponse.fail("Cannot read request body"));
    }

    // 3. Verify HMAC-SHA256 X-Verify signature (mirrors Django's verify_hubble_webhook)
    if (!webhookService.verifySignature(rawBody, xVerify)) {
      log.warn("Hubble webhook: invalid X-Verify signature from IP={}", clientIp);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(ApiResponse.fail("Invalid signature"));
    }

    // 4. Parse JSON payload
    JsonNode payload = null;
    try {
      payload = objectMapper.readTree(rawBody);
    } catch (Exception e) {
      log.warn("Hubble webhook: could not parse JSON body");
    }

    // 5. Extract event metadata (mirrors Django's field extraction logic)
    String eventType = "";
    String txRef = "";
    String orderStatus = "";
    String hubbleUserId = "";
    String amount = "";
    String discountAmount = "";
    String currency = "";

    if (payload != null) {
      eventType = textOrEmpty(payload, "event");
      if (eventType.isBlank() && payload.hasNonNull("orderStatus")) {
        eventType = "TRANSACTION";
      }
      txRef = textOrEmpty(payload, "transactionReferenceId");
      orderStatus = textOrEmpty(payload, "orderStatus");
      hubbleUserId = textOrEmpty(payload, "userId");
      amount = textOrEmpty(payload, "amount");
      discountAmount = textOrEmpty(payload, "discountAmount");
      currency = textOrEmpty(payload, "currency");
    }

    // 6. Build idempotency key (same algorithm as Django)
    String idempotencyKey;
    if (!txRef.isBlank()) {
      idempotencyKey = "hubble:tx:" + txRef + ":" + (orderStatus.isBlank() ? "NA" : orderStatus);
    } else {
      String detailId = "";
      try {
        if (payload != null && payload.hasNonNull("details")) {
          detailId = textOrEmpty(payload.get("details"), "id");
        }
      } catch (Exception ignored) {}
      idempotencyKey = "hubble:event:" + eventType + ":" + (detailId.isBlank() ? "NA" : detailId);
    }

    // 7. Store event idempotently
    long eventId;
    try {
      eventId = hubbleRepository.upsertWebhookEvent(
          idempotencyKey, eventType, txRef, orderStatus,
          xVerify != null ? xVerify : "",
          new String(rawBody, java.nio.charset.StandardCharsets.UTF_8)
      );
    } catch (Exception e) {
      log.error("Hubble webhook: failed to store event", e);
      return ResponseEntity.badRequest()
          .body(ApiResponse.fail("Failed to store webhook event: " + e.getMessage()));
    }

    // 8. Upsert transaction record (if txRef present)
    if (!txRef.isBlank()) {
      try {
        Long userId = null;
        if (!hubbleUserId.isBlank()) {
          userId = hubbleRepository.findUserIdByHubbleSubject(hubbleUserId).orElse(null);
        }
        hubbleRepository.upsertTransaction(
            txRef, hubbleUserId, userId, orderStatus,
            amount, discountAmount, currency, eventId
        );
      } catch (Exception e) {
        log.error("Hubble webhook: failed to upsert transaction for txRef={}", txRef, e);
        // Do not fail the webhook response — event is already stored
      }
    }

    log.info("Hubble webhook received: eventId={} type={} txRef={} status={}", eventId, eventType, txRef, orderStatus);
    return ResponseEntity.ok(ApiResponse.ok("ok", null));
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /** Resolve authenticated user from Bearer session token. Throws 401 if missing/invalid. */
  private User resolveUserFromBearerToken(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
    }
    // Call Django to validate the token and get user details
    com.trikonekt.consumer.user.dto.UserResponse djangoUser = djangoAuthClient.me(authHeader);
    return new User(
        djangoUser.getId(),
        djangoUser.getSponsorId(),
        djangoUser.getSponsorName(),
        djangoUser.getFullName(),
        djangoUser.getCountryCode(),
        djangoUser.getMobile(),
        djangoUser.getEmail(),
        djangoUser.getPinCode(),
        djangoUser.getDistrict(),
        djangoUser.getState(),
        null, // passwordHash not needed for Hubble
        djangoUser.getStatus(),
        djangoUser.isMobileVerified(),
        java.time.Instant.now()
    );
  }

  /** Extract leading digits from a string (for phone normalisation). */
  private String digitsOnly(String value) {
    if (value == null) return "";
    return value.replaceAll("[^0-9]", "");
  }

  /** Best-effort client IP extraction (checks X-Forwarded-For first). */
  private String extractClientIp(HttpServletRequest request) {
    String xff = request.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      return xff.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }

  /** Safely read a text field from a JsonNode; returns "" if missing or null. */
  private String textOrEmpty(JsonNode node, String field) {
    if (node == null || !node.hasNonNull(field)) return "";
    String v = node.get(field).asText();
    return v == null ? "" : v;
  }

  // ─── Coins / Wallet Endpoints ──────────────────────────────────────────────

  /**
   * GET /api/hubble/balance?userId=...
   */
  @GetMapping("/balance")
  public ResponseEntity<Object> getCoinBalance(
      @RequestHeader(value = "X-Hubble-Secret", required = false) String xHubbleSecret,
      @RequestParam("userId") String userIdStr) {

    if (!verifySecret(xHubbleSecret)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("error", "UNAUTHORIZED", "message", "Invalid X-Hubble-Secret"));
    }

    long userId;
    try {
      userId = Long.parseLong(userIdStr.trim());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", "BAD_REQUEST", "message", "Invalid user ID"));
    }

    double balance = hubbleRepository.getUserBalance(userId).orElse(-1.0);
    if (balance < 0) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("error", "USER_NOT_FOUND", "message", "No user with this ID"));
    }

    return ResponseEntity.ok(Map.of(
        "userId", userIdStr,
        "totalCoins", balance
    ));
  }

  /**
   * POST /api/hubble/debit
   */
  @PostMapping("/debit")
  public ResponseEntity<Object> debitCoins(
      @RequestHeader(value = "X-Hubble-Secret", required = false) String xHubbleSecret,
      @RequestBody JsonNode body) {

    if (!verifySecret(xHubbleSecret)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "UNAUTHORIZED"));
    }

    String userIdStr = textOrEmpty(body, "userId");
    double coins = body.hasNonNull("coins") ? body.get("coins").asDouble() : 0.0;
    String referenceId = textOrEmpty(body, "referenceId");
    String note = textOrEmpty(body, "note");

    if (userIdStr.isBlank() || referenceId.isBlank() || coins <= 0) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "BAD_REQUEST", "message", "Missing or invalid fields"));
    }

    long userId;
    try {
      userId = Long.parseLong(userIdStr.trim());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "BAD_REQUEST", "message", "Invalid user ID"));
    }

    // 1. Idempotency Check
    Optional<Double> existingBalanceAfter = hubbleRepository.getTransactionBalanceAfter("HUBBLE_DEBIT", referenceId);
    if (existingBalanceAfter.isPresent()) {
      log.info("Hubble coin debit duplicate request received for referenceId={}", referenceId);
      return ResponseEntity.ok(Map.of(
          "status", "SUCCESS",
          "transactionId", referenceId,
          "balance", existingBalanceAfter.get(),
          "referenceId", referenceId
      ));
    }

    // 2. Perform Debit
    try {
      double newBalance = hubbleRepository.debitWalletBalance(userId, coins, referenceId, note);
      return ResponseEntity.ok(Map.of(
          "status", "SUCCESS",
          "transactionId", referenceId,
          "balance", newBalance,
          "referenceId", referenceId
      ));
    } catch (IllegalArgumentException e) {
      if ("INSUFFICIENT_BALANCE".equals(e.getMessage())) {
        double currentBalance = hubbleRepository.getUserBalance(userId).orElse(0.0);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "status", "INSUFFICIENT_BALANCE",
                "balance", currentBalance
            ));
      }
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "BAD_REQUEST", "message", e.getMessage()));
    } catch (Exception e) {
      log.error("Failed to debit wallet for user={}", userId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "INTERNAL_ERROR", "message", e.getMessage()));
    }
  }

  /**
   * POST /api/hubble/reverse
   */
  @PostMapping("/reverse")
  public ResponseEntity<Object> reverseDebit(
      @RequestHeader(value = "X-Hubble-Secret", required = false) String xHubbleSecret,
      @RequestBody JsonNode body) {

    if (!verifySecret(xHubbleSecret)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "UNAUTHORIZED"));
    }

    String userIdStr = textOrEmpty(body, "userId");
    String referenceId = textOrEmpty(body, "referenceId");
    String note = textOrEmpty(body, "note");

    if (userIdStr.isBlank() || referenceId.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "BAD_REQUEST", "message", "Missing or invalid fields"));
    }

    long userId;
    try {
      userId = Long.parseLong(userIdStr.trim());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "BAD_REQUEST", "message", "Invalid user ID"));
    }

    // 1. Idempotency Check (Already reversed?)
    Optional<Double> existingBalanceAfter = hubbleRepository.getTransactionBalanceAfter("HUBBLE_REVERSAL", referenceId);
    if (existingBalanceAfter.isPresent()) {
      log.info("Hubble coin reversal duplicate request received for referenceId={}", referenceId);
      return ResponseEntity.ok(Map.of(
          "status", "SUCCESS",
          "transactionId", referenceId,
          "balance", existingBalanceAfter.get(),
          "referenceId", referenceId
      ));
    }

    // 2. Find original debit amount
    Optional<Double> debitAmount = hubbleRepository.findOriginalDebitAmount(referenceId, userId);
    if (debitAmount.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of(
              "status", "TRANSACTION_NOT_FOUND",
              "message", "No debit found for this referenceId"
          ));
    }

    // 3. Perform Credit Refund
    try {
      double newBalance = hubbleRepository.creditWalletBalance(userId, debitAmount.get(), referenceId, note);
      return ResponseEntity.ok(Map.of(
          "status", "SUCCESS",
          "transactionId", referenceId,
          "balance", newBalance,
          "referenceId", referenceId
      ));
    } catch (Exception e) {
      log.error("Failed to reverse wallet debit for user={}", userId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("status", "INTERNAL_ERROR", "message", e.getMessage()));
    }
  }

  private boolean verifySecret(String secret) {
    String expected = config.getWebhookSecret();
    if (expected.isBlank() || secret == null) return false;
    return expected.trim().equals(secret.trim());
  }
}
