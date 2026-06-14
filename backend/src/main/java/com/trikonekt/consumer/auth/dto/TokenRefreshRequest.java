package com.trikonekt.consumer.auth.dto;

import javax.validation.constraints.NotBlank;

public class TokenRefreshRequest {
  @NotBlank
  private String refresh;

  public String refresh() {
    return refresh;
  }

  public void setRefresh(String refresh) {
    this.refresh = refresh;
  }
}
