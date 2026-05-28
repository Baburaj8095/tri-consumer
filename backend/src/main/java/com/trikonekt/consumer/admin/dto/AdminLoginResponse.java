package com.trikonekt.consumer.admin.dto;

public class AdminLoginResponse {
  private final String token;
  private final String username;

  public AdminLoginResponse(String token, String username) {
    this.token = token;
    this.username = username;
  }

  public String getToken() { return token; }
  public String getUsername() { return username; }
}

