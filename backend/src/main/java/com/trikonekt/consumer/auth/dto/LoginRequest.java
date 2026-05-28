package com.trikonekt.consumer.auth.dto;

import javax.validation.constraints.NotBlank;

public class LoginRequest {
  @NotBlank
  private String username;
  @NotBlank
  private String password;

  public String username() { return username; }
  public String password() { return password; }
  public void setUsername(String username) { this.username = username; }
  public void setPassword(String password) { this.password = password; }
}
