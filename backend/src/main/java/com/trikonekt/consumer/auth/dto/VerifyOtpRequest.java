package com.trikonekt.consumer.auth.dto;

import com.trikonekt.consumer.auth.OtpPurpose;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

public class VerifyOtpRequest {
  @NotBlank
  private String mobile;
  private String countryCode;
  private OtpPurpose purpose;
  @NotBlank
  @Pattern(regexp = "\\d{6}")
  private String otp;

  public String mobile() { return mobile; }
  public String countryCode() { return countryCode; }
  public OtpPurpose purpose() { return purpose; }
  public String otp() { return otp; }
  public void setMobile(String mobile) { this.mobile = mobile; }
  public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
  public void setPurpose(OtpPurpose purpose) { this.purpose = purpose; }
  public void setOtp(String otp) { this.otp = otp; }
}
