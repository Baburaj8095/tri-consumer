package com.trikonekt.consumer.user.dto;

import com.trikonekt.consumer.user.User;

public class UserResponse {
  private long id;
  private String sponsorId;
  private String sponsorName;
  private String fullName;
  private String countryCode;
  private String mobile;
  private String email;
  private String pinCode;
  private String district;
  private String state;
  private String status;
  private boolean mobileVerified;
  private String walletBalance;
  private String idNumber;

  public UserResponse(long id, String sponsorId, String sponsorName, String fullName, String countryCode,
      String mobile, String email, String pinCode, String district, String state, String status,
      boolean mobileVerified) {
    this(id, sponsorId, sponsorName, fullName, countryCode, mobile, email, pinCode, district, state, status, mobileVerified, null);
  }

  public UserResponse(long id, String sponsorId, String sponsorName, String fullName, String countryCode,
      String mobile, String email, String pinCode, String district, String state, String status,
      boolean mobileVerified, String walletBalance) {
    this(id, sponsorId, sponsorName, fullName, countryCode, mobile, email, pinCode, district, state, status, mobileVerified, walletBalance, null);
  }

  public UserResponse(long id, String sponsorId, String sponsorName, String fullName, String countryCode,
      String mobile, String email, String pinCode, String district, String state, String status,
      boolean mobileVerified, String walletBalance, String idNumber) {
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
    this.status = status;
    this.mobileVerified = mobileVerified;
    this.walletBalance = walletBalance;
    this.idNumber = idNumber;
  }

  public static UserResponse from(User user) {
    return new UserResponse(user.id(), user.sponsorId(), user.sponsorName(), user.fullName(), user.countryCode(),
        user.mobile(), user.email(), user.pinCode(), user.district(), user.state(), user.status(),
        user.mobileVerified());
  }

  public long getId() { return id; }
  public String getSponsorId() { return sponsorId; }
  public String getSponsorName() { return sponsorName; }
  public String getFullName() { return fullName; }
  public String getCountryCode() { return countryCode; }
  public String getMobile() { return mobile; }
  public String getEmail() { return email; }
  public String getPinCode() { return pinCode; }
  public String getDistrict() { return district; }
  public String getState() { return state; }
  public String getStatus() { return status; }
  public boolean isMobileVerified() { return mobileVerified; }
  public String getWalletBalance() { return walletBalance; }
  public String getIdNumber() { return idNumber; }
}
