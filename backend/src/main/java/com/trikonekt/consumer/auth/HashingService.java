package com.trikonekt.consumer.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class HashingService {
  @Value("${app.otp.pepper}")
  private String pepper;

  public String otpHash(String mobile, String otp) {
    return sha256(pepper + ":otp:" + mobile + ":" + otp);
  }

  public String tokenHash(String token) {
    return sha256(pepper + ":session:" + token);
  }

  public String adminTokenHash(String token) {
    return sha256(pepper + ":admin-session:" + token);
  }

  private String sha256(String value) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException ex) {
      throw new IllegalStateException("SHA-256 is not available", ex);
    }
  }
}
