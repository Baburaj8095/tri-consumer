package com.trikonekt.consumer.hubble;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Generates short-lived RS256 JWTs for Hubble SSO login.
 *
 * Mirrors Django's core/hubble.py → generate_hubble_sso_jwt()
 *
 * Expected JWT payload (matches Hubble docs exactly):
 * {
 *   "sub":         "user_id_string",
 *   "iss":         "partner-client-id",
 *   "iat":         1711929600,
 *   "exp":         1711929660,     ← 60 seconds lifetime
 *   "name":        "Full Name",
 *   "email":       "user@example.com",
 *   "phoneNumber": "919999912345",
 *   "cohorts":     ["consumer"]
 * }
 */
@Service
public class HubbleJwtService {

  private static final int TOKEN_LIFETIME_SECONDS = 60;

  private final HubbleConfig config;

  public HubbleJwtService(HubbleConfig config) {
    this.config = config;
  }

  /**
   * Generate a Hubble SSO JWT for the given user.
   *
   * @param subject     Our user ID (string) — becomes JWT "sub"
   * @param name        User's full name
   * @param email       User's email
   * @param phoneNumber E.164 or national digits phone (e.g. "919876543210")
   * @param cohorts     List of cohort tags (e.g. ["consumer"])
   * @return Signed RS256 JWT string
   */
  public String generateSsoToken(String subject, String name, String email,
                                  String phoneNumber, List<String> cohorts) {
    if (config.getClientId().isBlank()) {
      throw new IllegalStateException("HUBBLE_CLIENT_ID (app.hubble.client-id) is not configured");
    }
    if (config.getJwtPrivateKeyPem().isBlank()) {
      throw new IllegalStateException("HUBBLE_JWT_PRIVATE_KEY_PEM (app.hubble.jwt-private-key-pem) is not configured");
    }

    PrivateKey privateKey = loadPrivateKey(config.getJwtPrivateKeyPem());

    long nowMillis = System.currentTimeMillis();
    Date now = new Date(nowMillis);
    Date exp = new Date(nowMillis + (long) TOKEN_LIFETIME_SECONDS * 1000);

    Map<String, Object> claims = new HashMap<>();
    if (name != null && !name.isBlank())        claims.put("name", name.trim());
    if (email != null && !email.isBlank())       claims.put("email", email.trim());
    if (phoneNumber != null && !phoneNumber.isBlank()) claims.put("phoneNumber", phoneNumber.trim());
    if (cohorts != null && !cohorts.isEmpty())   claims.put("cohorts", cohorts);

    return Jwts.builder()
        .claims(claims)
        .subject(subject)
        .issuer(config.getClientId())
        .issuedAt(now)
        .expiration(exp)
        .signWith(privateKey, SignatureAlgorithm.RS256)
        .compact();
  }

  /**
   * Build the full Hubble Web SDK iframe URL.
   * Mirrors Django's core/hubble.py → build_hubble_web_sdk_url()
   *
   * Format: {sdkBaseUrl}/?clientId={id}&token={jwt}[&theme={theme}]
   */
  public String buildIframeUrl(String token) {
    if (token == null || token.isBlank()) throw new IllegalArgumentException("token is required");
    if (config.getSdkBaseUrl().isBlank())  throw new IllegalStateException("HUBBLE_SDK_BASE_URL is not configured");
    if (config.getClientId().isBlank())    throw new IllegalStateException("HUBBLE_CLIENT_ID is not configured");

    String base = config.getSdkBaseUrl().replaceAll("/+$", "");
    StringBuilder url = new StringBuilder(base)
        .append("/?clientId=").append(encode(config.getClientId()))
        .append("&token=").append(encode(token));

    if (!config.getSdkTheme().isBlank()) {
      url.append("&theme=").append(encode(config.getSdkTheme()));
    }
    return url.toString();
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Parse a PEM-encoded PKCS#8 RSA private key.
   * Accepts keys with or without -----BEGIN PRIVATE KEY----- headers.
   * Also handles \n escaped as literal backslash-n (common in env vars).
   */
  private PrivateKey loadPrivateKey(String pem) {
    try {
      // Normalise newline escape sequences from env var storage
      String normalised = pem
          .replace("\\n", "\n")
          .replace("-----BEGIN PRIVATE KEY-----", "")
          .replace("-----END PRIVATE KEY-----", "")
          .replace("-----BEGIN RSA PRIVATE KEY-----", "")
          .replace("-----END RSA PRIVATE KEY-----", "")
          .replaceAll("\\s+", "");

      byte[] decoded = Base64.getDecoder().decode(normalised.getBytes(StandardCharsets.UTF_8));
      KeyFactory kf = KeyFactory.getInstance("RSA");
      return kf.generatePrivate(new PKCS8EncodedKeySpec(decoded));
    } catch (Exception e) {
      throw new IllegalStateException("Failed to parse HUBBLE_JWT_PRIVATE_KEY_PEM: " + e.getMessage(), e);
    }
  }

  private String encode(String value) {
    try {
      return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8.name());
    } catch (Exception e) {
      return value;
    }
  }
}
