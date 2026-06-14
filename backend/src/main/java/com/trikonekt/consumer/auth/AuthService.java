package com.trikonekt.consumer.auth;

import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.auth.dto.LoginRequest;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final DjangoAuthClient djangoAuthClient;

  public AuthService(DjangoAuthClient djangoAuthClient) {
    this.djangoAuthClient = djangoAuthClient;
  }

  public AuthResponse register(RegisterRequest request) {
    return djangoAuthClient.register(request);
  }

  public AuthResponse login(LoginRequest request) {
    return djangoAuthClient.login(request);
  }

  public AuthResponse createOtpLogin(String mobile) {
    return djangoAuthClient.otpLogin(mobile);
  }

  public AuthResponse refreshToken(String refreshToken) {
    return djangoAuthClient.refreshToken(refreshToken);
  }

  public String validateSponsor(String sponsorId) {
    return djangoAuthClient.validateSponsor(sponsorId);
  }


  public static String normalizeCountryCode(String countryCode) {
    String value = countryCode == null || countryCode.isBlank() ? "+91" : countryCode.trim();
    return value.startsWith("+") ? value : "+" + value;
  }

  public static String normalizeMobile(String countryCode, String mobile) {
    String digits = mobile.replaceAll("[^0-9]", "");
    String countryDigits = normalizeCountryCode(countryCode).replace("+", "");
    if (digits.length() == 10) {
      return countryDigits + digits;
    }
    return digits;
  }
}
