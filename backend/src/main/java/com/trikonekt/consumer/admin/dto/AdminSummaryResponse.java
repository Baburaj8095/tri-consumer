package com.trikonekt.consumer.admin.dto;

public class AdminSummaryResponse {
  private final int totalUsers;
  private final int verifiedUsers;
  private final int otpRequests;
  private final int consumedOtps;

  public AdminSummaryResponse(int totalUsers, int verifiedUsers, int otpRequests, int consumedOtps) {
    this.totalUsers = totalUsers;
    this.verifiedUsers = verifiedUsers;
    this.otpRequests = otpRequests;
    this.consumedOtps = consumedOtps;
  }

  public int getTotalUsers() { return totalUsers; }
  public int getVerifiedUsers() { return verifiedUsers; }
  public int getOtpRequests() { return otpRequests; }
  public int getConsumedOtps() { return consumedOtps; }
}

