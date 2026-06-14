package com.trikonekt.consumer.auth.dto;

import com.trikonekt.consumer.user.dto.UserResponse;

public class AuthResponse {
  private String token;
  private String access;
  private String refresh;
  private UserResponse user;

  public AuthResponse(String token, UserResponse user) {
    this.token = token;
    this.access = token;
    this.refresh = null;
    this.user = user;
  }

  public AuthResponse(String access, String refresh, UserResponse user) {
    this.token = access;
    this.access = access;
    this.refresh = refresh;
    this.user = user;
  }

  public String getToken() { return token; }
  public String getAccess() { return access; }
  public String getRefresh() { return refresh; }
  public UserResponse getUser() { return user; }
}
