package com.trikonekt.consumer.auth;

import java.time.Instant;

public class OtpRecord {
  private final long id;
  private final String mobile;
  private final OtpPurpose purpose;
  private final String otpHash;
  private final Instant expiresAt;
  private final int attempts;

  public OtpRecord(long id, String mobile, OtpPurpose purpose, String otpHash, Instant expiresAt, int attempts) {
    this.id = id;
    this.mobile = mobile;
    this.purpose = purpose;
    this.otpHash = otpHash;
    this.expiresAt = expiresAt;
    this.attempts = attempts;
  }

  public long id() { return id; }
  public String mobile() { return mobile; }
  public OtpPurpose purpose() { return purpose; }
  public String otpHash() { return otpHash; }
  public Instant expiresAt() { return expiresAt; }
  public int attempts() { return attempts; }
}

