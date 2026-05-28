package com.trikonekt.consumer.auth.dto;

import com.trikonekt.consumer.auth.OtpPurpose;
import javax.validation.constraints.NotBlank;

public class SendOtpRequest {
  @NotBlank
  private String mobile;
  private String countryCode;
  private OtpPurpose purpose;

  public String mobile() { return mobile; }
  public String countryCode() { return countryCode; }
  public OtpPurpose purpose() { return purpose; }
  public void setMobile(String mobile) { this.mobile = mobile; }
  public void setCountryCode(String countryCode) { this.countryCode = countryCode; }
  public void setPurpose(OtpPurpose purpose) { this.purpose = purpose; }
}
