package com.trikonekt.consumer.hubble;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/**
 * Verifies Hubble webhook X-Verify HMAC-SHA256 signatures.
 *
 * Mirrors Django's core/hubble.py → verify_hubble_webhook()
 *
 * Hubble docs: X-Verify = Base64(HMAC-SHA256(rawBody, webhookSecret))
 */
@Service
public class HubbleWebhookService {

  private final HubbleConfig config;

  public HubbleWebhookService(HubbleConfig config) {
    this.config = config;
  }

  /**
   * Verify that the X-Verify header matches the expected HMAC-SHA256 of rawBody.
   *
   * @param rawBody  The raw HTTP request body bytes
   * @param xVerify  The value of the X-Verify header
   * @return true if valid, false otherwise
   */
  public boolean verifySignature(byte[] rawBody, String xVerify) {
    String secret = config.getWebhookSecret();
    if (secret.isBlank() || xVerify == null || xVerify.isBlank()) {
      return false;
    }
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      byte[] digest = mac.doFinal(rawBody == null ? new byte[0] : rawBody);
      String expectedB64 = Base64.getEncoder().encodeToString(digest);
      // Constant-time compare to prevent timing attacks
      return constantTimeEquals(expectedB64, xVerify.trim());
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * Check if an IP is within the configured allowlist.
   * Returns true (allowed) if allowlist is empty (disabled) — same as Django.
   */
  public boolean isIpAllowed(String ip) {
    String allowlist = config.getWebhookIpAllowlist();
    if (allowlist.isBlank()) return true; // disabled — allow all
    if (ip == null || ip.isBlank()) return false;
    for (String allowed : allowlist.split(",")) {
      if (ip.trim().equals(allowed.trim())) return true;
    }
    return false;
  }

  /** Constant-time string comparison to avoid timing side-channels. */
  private boolean constantTimeEquals(String a, String b) {
    if (a.length() != b.length()) return false;
    int result = 0;
    for (int i = 0; i < a.length(); i++) {
      result |= a.charAt(i) ^ b.charAt(i);
    }
    return result == 0;
  }
}
