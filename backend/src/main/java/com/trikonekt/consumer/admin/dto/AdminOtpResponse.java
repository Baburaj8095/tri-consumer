package com.trikonekt.consumer.admin.dto;

import java.time.Instant;

public class AdminOtpResponse {
  private final long id;
  private final String mobile;
  private final String purpose;
  private final Instant expiresAt;
  private final Instant consumedAt;
  private final int attempts;
  private final String providerMessageId;
  private final String providerResponse;
  private final Instant createdAt;

  public AdminOtpResponse(long id, String mobile, String purpose, Instant expiresAt, Instant consumedAt,
      int attempts, String providerMessageId, String providerResponse, Instant createdAt) {
    this.id = id;
    this.mobile = mobile;
    this.purpose = purpose;
    this.expiresAt = expiresAt;
    this.consumedAt = consumedAt;
    this.attempts = attempts;
    this.providerMessageId = providerMessageId;
    this.providerResponse = providerResponse;
    this.createdAt = createdAt;
  }

  public long getId() { return id; }
  public String getMobile() { return mobile; }
  public String getPurpose() { return purpose; }
  public Instant getExpiresAt() { return expiresAt; }
  public Instant getConsumedAt() { return consumedAt; }
  public int getAttempts() { return attempts; }
  public String getProviderMessageId() { return providerMessageId; }
  public String getProviderResponse() { return providerResponse; }
  public Instant getCreatedAt() { return createdAt; }
}
