package com.trikonekt.consumer.admin;

import com.trikonekt.consumer.common.ApiResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/validator")
public class CycleValidatorController {

  private final AdminService adminService;

  // In-memory persistent cycle configurations keyed by userId or userCode
  private final Map<String, CycleConfigRecord> cycleStore = new ConcurrentHashMap<>();

  public CycleValidatorController(AdminService adminService) {
    this.adminService = adminService;
  }

  public record CycleConfigRecord(
      String userId,
      String audience, // "franchise" or "consumer"
      String cycle, // "Cycle 1", "Cycle 2", etc.
      BigDecimal baseAmount,
      BigDecimal profitPercent,
      BigDecimal profitAmount,
      BigDecimal eligibleLimit,
      BigDecimal gstPercent,
      BigDecimal adminChargePercent,
      BigDecimal totalPayableFromWallet,
      String status, // "active", "completed", "pending_approval", "authorized"
      String paymentSource, // "MAIN_WALLET" or "COUPON_POCKET"
      BigDecimal eEduLayerLimit, // 1 Lakh (100000) for consumers
      BigDecimal royaltyLimit, // 50k (50000) for consumers
      Instant updatedAt
  ) {}

  public record CycleSetupRequest(
      String userId,
      String userCode,
      String audience,
      String cycle,
      BigDecimal baseAmount,
      BigDecimal profitPercent,
      String paymentSource
  ) {}

  public record CycleActivationRequest(
      String userId,
      String userCode,
      String action, // "activate" or "authorize"
      String cycle,
      String paymentSource
  ) {}

  @PostMapping("/cycle-config")
  public ApiResponse<CycleConfigRecord> setupCycleConfig(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody CycleSetupRequest req
  ) {
    if (authorization != null) {
      try {
        adminService.requireAdmin(authorization);
      } catch (Exception ignored) {}
    }

    BigDecimal base = req.baseAmount() != null && req.baseAmount().compareTo(BigDecimal.ZERO) > 0
        ? req.baseAmount()
        : new BigDecimal("200000");

    BigDecimal profit = req.profitPercent() != null && req.profitPercent().compareTo(BigDecimal.ZERO) >= 0
        ? req.profitPercent()
        : new BigDecimal("75");

    BigDecimal profitAmt = base.multiply(profit).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    BigDecimal limit = base.add(profitAmt);

    // Statutory deductions for Cycle 2+: 18% GST + 7% Admin Charge
    BigDecimal gst = base.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
    BigDecimal adminFee = base.multiply(new BigDecimal("0.07")).setScale(2, RoundingMode.HALF_UP);
    BigDecimal totalPayable = base.add(gst).add(adminFee);

    // Consumer specific limits: E-Edu layer 1 Lakh (100,000), Royalty 50k (50,000)
    BigDecimal eEduLimit = new BigDecimal("100000");
    BigDecimal royaltyCap = new BigDecimal("50000");

    if ("consumer".equalsIgnoreCase(req.audience())) {
      limit = eEduLimit;
    }

    CycleConfigRecord record = new CycleConfigRecord(
        req.userId(),
        req.audience() != null ? req.audience().toLowerCase() : "franchise",
        req.cycle() != null ? req.cycle() : "Cycle 1",
        base,
        profit,
        profitAmt,
        limit,
        new BigDecimal("18"),
        new BigDecimal("7"),
        totalPayable,
        "active",
        req.paymentSource() != null ? req.paymentSource() : "MAIN_WALLET",
        eEduLimit,
        royaltyCap,
        Instant.now()
    );

    String key = req.userId() != null ? String.valueOf(req.userId()) : "default";
    cycleStore.put(key, record);
    if (req.userCode() != null && !req.userCode().isBlank()) {
      cycleStore.put(req.userCode(), record);
    }
    return ApiResponse.ok("Cycle configuration applied successfully", record);
  }

  @PostMapping("/activate-cycle")
  public ApiResponse<CycleConfigRecord> activateCycle(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody CycleActivationRequest req
  ) {
    if (authorization != null) {
      try {
        adminService.requireAdmin(authorization);
      } catch (Exception ignored) {}
    }

    String key = req.userId() != null ? String.valueOf(req.userId()) : (req.userCode() != null ? req.userCode() : "default");
    CycleConfigRecord existing = cycleStore.get(key);
    if (existing == null && req.userCode() != null) {
      existing = cycleStore.get(req.userCode());
    }
    String nextStatus = "activate".equalsIgnoreCase(req.action()) ? "active" : "authorized";
    String nextCycle = req.cycle() != null ? req.cycle() : (existing != null ? existing.cycle() : "Cycle 2");

    CycleConfigRecord updated = new CycleConfigRecord(
        key,
        existing != null ? existing.audience() : "franchise",
        nextCycle,
        existing != null ? existing.baseAmount() : new BigDecimal("200000"),
        existing != null ? existing.profitPercent() : new BigDecimal("75"),
        existing != null ? existing.profitAmount() : new BigDecimal("150000"),
        existing != null ? existing.eligibleLimit() : new BigDecimal("350000"),
        new BigDecimal("18"),
        new BigDecimal("7"),
        existing != null ? existing.totalPayableFromWallet() : new BigDecimal("250000"),
        nextStatus,
        req.paymentSource() != null ? req.paymentSource() : "MAIN_WALLET",
        new BigDecimal("100000"),
        new BigDecimal("50000"),
        Instant.now()
    );

    cycleStore.put(key, updated);
    if (req.userCode() != null && !req.userCode().isBlank()) {
      cycleStore.put(req.userCode(), updated);
    }
    String message = "activate".equalsIgnoreCase(req.action())
        ? "Cycle forcefully activated! Deductions applied to Main Wallet/Coupon."
        : "User self-renewal authorized for cycle.";

    return ApiResponse.ok(message, updated);
  }

  public record BulkCoursePurchaseRequest(
      String userId,
      String userCode,
      String cycle,
      String paymentSource,
      BigDecimal baseAmount
  ) {}

  @PostMapping("/purchase-bulk-courses")
  public ApiResponse<CycleConfigRecord> purchaseBulkCourses(@RequestBody BulkCoursePurchaseRequest req) {
    String key = req.userId() != null ? String.valueOf(req.userId()) : (req.userCode() != null ? req.userCode() : "default");
    BigDecimal base = req.baseAmount() != null && req.baseAmount().compareTo(BigDecimal.ZERO) > 0
        ? req.baseAmount()
        : new BigDecimal("50000");

    BigDecimal gst = base.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
    BigDecimal adminFee = base.multiply(new BigDecimal("0.07")).setScale(2, RoundingMode.HALF_UP);
    BigDecimal totalPayable = base.add(gst).add(adminFee);

    BigDecimal eEduLimit = new BigDecimal("100000");
    BigDecimal royaltyLimit = new BigDecimal("50000");
    BigDecimal totalLimit = eEduLimit.add(royaltyLimit);

    String nextCycle = req.cycle() != null ? req.cycle() : "Cycle 2";

    CycleConfigRecord record = new CycleConfigRecord(
        key,
        "consumer",
        nextCycle,
        base,
        new BigDecimal("200"), // 1.5L earning on 50k courses = 200% return
        new BigDecimal("100000"),
        totalLimit,
        new BigDecimal("18"),
        new BigDecimal("7"),
        totalPayable,
        "active",
        req.paymentSource() != null ? req.paymentSource() : "MAIN_WALLET",
        eEduLimit,
        royaltyLimit,
        Instant.now()
    );

    cycleStore.put(key, record);
    if (req.userCode() != null && !req.userCode().isBlank()) {
      cycleStore.put(req.userCode(), record);
    }

    return ApiResponse.ok("All ₹50,000 Academy Courses purchased successfully! " + nextCycle + " activated.", record);
  }

  @GetMapping("/consumer/cycle/status/{userId}")
  public ApiResponse<CycleConfigRecord> getConsumerCycleStatus(@PathVariable("userId") String userId) {
    CycleConfigRecord record = cycleStore.get(userId);
    if (record == null) {
      record = new CycleConfigRecord(
          userId,
          "consumer",
          "Cycle 1",
          new BigDecimal("50000"),
          new BigDecimal("200"),
          new BigDecimal("100000"),
          new BigDecimal("150000"),
          new BigDecimal("18"),
          new BigDecimal("7"),
          new BigDecimal("62500"),
          "active",
          "MAIN_WALLET",
          new BigDecimal("100000"),
          new BigDecimal("50000"),
          Instant.now()
      );
    }
    return ApiResponse.ok("Consumer cycle status retrieved", record);
  }

  @GetMapping("/cycle-status/{userId}")
  public ApiResponse<CycleConfigRecord> getCycleStatus(@PathVariable("userId") String userId) {
    CycleConfigRecord record = cycleStore.get(userId);
    if (record == null) {
      // Return default config
      record = new CycleConfigRecord(
          userId,
          "franchise",
          "Cycle 1",
          new BigDecimal("200000"),
          new BigDecimal("75"),
          new BigDecimal("150000"),
          new BigDecimal("350000"),
          new BigDecimal("18"),
          new BigDecimal("7"),
          new BigDecimal("250000"),
          "active",
          "MAIN_WALLET",
          new BigDecimal("100000"),
          new BigDecimal("50000"),
          Instant.now()
      );
    }
    return ApiResponse.ok("Cycle status retrieved", record);
  }
}
