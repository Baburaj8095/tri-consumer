package com.trikonekt.consumer.auth.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class RegisterRequest {
  private String sponsorId;
  private String sponsorName;
  @NotBlank
  private String fullName;
  @NotBlank
  private String mobile;
  private String countryCode;
  @Email
  private String email;
  private String pinCode;
  private String district;
  private String state;
  @NotBlank
  @Size(min = 6)
  private String password;

  public String sponsorId() { return sponsorId; }
  public String sponsorName() { return sponsorName; }
  public String fullName() { return fullName; }
  public String mobile() { return mobile; }
  public String countryCode() { return countryCode; }
  public String email() { return email; }
  public String pinCode() { return pinCode; }
  public String district() { return district; }
  public String state() { return state; }
  public String password() { return password; }
  public void setSponsorId(String sponsorId) { this.sponsorId = sponsorId; }
  public void setSponsorName(String sponsorName) { this.sponsorName = sponsorName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public void setMobile(String mobile) { this.mobile = mobile; }
  public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
  public void setEmail(String email) { this.email = email; }
  public void setPinCode(String pinCode) { this.pinCode = pinCode; }
  public void setDistrict(String district) { this.district = district; }
  public void setState(String state) { this.state = state; }
  public void setPassword(String password) { this.password = password; }
}
