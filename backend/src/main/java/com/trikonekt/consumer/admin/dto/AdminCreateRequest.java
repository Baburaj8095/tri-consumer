package com.trikonekt.consumer.admin.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class AdminCreateRequest {
  @NotBlank
  @Size(min = 3, max = 50)
  private String username;

  @NotBlank
  @Size(min = 6, max = 100)
  private String password;

  public String username() { return username; }
  public String password() { return password; }
  public void setUsername(String username) { this.username = username; }
  public void setPassword(String password) { this.password = password; }
}
