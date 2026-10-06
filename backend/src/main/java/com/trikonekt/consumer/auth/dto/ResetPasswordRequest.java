package com.trikonekt.consumer.auth.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class ResetPasswordRequest {
  @NotBlank
  private String mobile;
  private String countryCode;
  @NotBlank
  @Pattern(regexp = "\\d{6}", message = "OTP must be exactly 6 digits")
  private String otp;
  @NotBlank
  @Size(min = 6, message = "Password must be at least 6 characters")
  private String newPassword;

  public String mobile() { return mobile; }
  public String countryCode() { return countryCode; }
  public String otp() { return otp; }
  public String newPassword() { return newPassword; }

  public void setMobile(String mobile) { this.mobile = mobile; }
  public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
  public void setOtp(String otp) { this.otp = otp; }
  public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}

