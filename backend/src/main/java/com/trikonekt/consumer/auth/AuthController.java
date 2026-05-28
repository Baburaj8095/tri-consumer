package com.trikonekt.consumer.auth;

import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.auth.dto.LoginRequest;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import com.trikonekt.consumer.auth.dto.SendOtpRequest;
import com.trikonekt.consumer.auth.dto.VerifyOtpRequest;
import com.trikonekt.consumer.common.ApiResponse;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final OtpService otpService;
  private final AuthService authService;

  public AuthController(OtpService otpService, AuthService authService) {
    this.otpService = otpService;
    this.authService = authService;
  }

  @PostMapping("/send-otp")
  public ApiResponse<Void> sendOtp(@Valid @RequestBody SendOtpRequest request) {
    OtpPurpose purpose = request.purpose() == null ? OtpPurpose.LOGIN : request.purpose();
    String mobile = AuthService.normalizeMobile(request.countryCode(), request.mobile());
    otpService.sendOtp(mobile, purpose);
    return ApiResponse.ok("OTP sent", null);
  }

  @PostMapping("/verify-otp")
  public ApiResponse<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
    OtpPurpose purpose = request.purpose() == null ? OtpPurpose.LOGIN : request.purpose();
    String mobile = AuthService.normalizeMobile(request.countryCode(), request.mobile());
    otpService.verifyOtp(mobile, purpose, request.otp());
    AuthResponse response = purpose == OtpPurpose.LOGIN ? authService.createOtpLogin(mobile) : null;
    return ApiResponse.ok("OTP verified", response);
  }

  @PostMapping("/register")
  public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ApiResponse.ok("Registration complete", authService.register(request));
  }

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ApiResponse.ok("Login successful", authService.login(request));
  }
}
