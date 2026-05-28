package com.trikonekt.consumer.user;

import java.time.Instant;

public class User {
  private final long id;
  private final String sponsorId;
  private final String sponsorName;
  private final String fullName;
  private final String countryCode;
  private final String mobile;
  private final String email;
  private final String pinCode;
  private final String district;
  private final String state;
  private final String passwordHash;
  private final String status;
  private final boolean mobileVerified;
  private final Instant createdAt;

  public User(long id, String sponsorId, String sponsorName, String fullName, String countryCode, String mobile,
      String email, String pinCode, String district, String state, String passwordHash, String status,
      boolean mobileVerified, Instant createdAt) {
    this.id = id;
    this.sponsorId = sponsorId;
    this.sponsorName = sponsorName;
    this.fullName = fullName;
    this.countryCode = countryCode;
    this.mobile = mobile;
    this.email = email;
    this.pinCode = pinCode;
    this.district = district;
    this.state = state;
    this.passwordHash = passwordHash;
    this.status = status;
    this.mobileVerified = mobileVerified;
    this.createdAt = createdAt;
  }

  public long id() { return id; }
  public String sponsorId() { return sponsorId; }
  public String sponsorName() { return sponsorName; }
  public String fullName() { return fullName; }
  public String countryCode() { return countryCode; }
  public String mobile() { return mobile; }
  public String email() { return email; }
  public String pinCode() { return pinCode; }
  public String district() { return district; }
  public String state() { return state; }
  public String passwordHash() { return passwordHash; }
  public String status() { return status; }
  public boolean mobileVerified() { return mobileVerified; }
  public Instant createdAt() { return createdAt; }
}
