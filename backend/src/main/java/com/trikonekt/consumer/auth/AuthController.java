package com.trikonekt.consumer.auth;

import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.auth.dto.LoginRequest;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import com.trikonekt.consumer.auth.dto.SendOtpRequest;
import com.trikonekt.consumer.auth.dto.VerifyOtpRequest;
import com.trikonekt.consumer.common.ApiResponse;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trikonekt.consumer.user.UserRepository;
import com.trikonekt.consumer.common.BusinessException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final OtpService otpService;
  private final AuthService authService;
  private final UserRepository userRepository;

  public AuthController(OtpService otpService, AuthService authService, UserRepository userRepository) {
    this.otpService = otpService;
    this.authService = authService;
    this.userRepository = userRepository;
  }

  @PostMapping("/send-otp")
  public ApiResponse<Void> sendOtp(@Valid @RequestBody SendOtpRequest request) {
    OtpPurpose purpose = request.purpose() == null ? OtpPurpose.LOGIN : request.purpose();
    String mobile = AuthService.normalizeMobile(request.countryCode(), request.mobile());
    
    if (purpose == OtpPurpose.LOGIN) {
      if (userRepository.findByMobile(mobile).isEmpty()) {
        throw new BusinessException(HttpStatus.NOT_FOUND, "User is not registered. Please sign up first.");
      }
    }

    otpService.sendOtp(mobile, purpose);
    return ApiResponse.ok("OTP sent", null);
  }

  @PostMapping("/verify-otp")
  public ApiResponse<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
    OtpPurpose purpose = request.purpose() == null ? OtpPurpose.LOGIN : request.purpose();
    String mobile = AuthService.normalizeMobile(request.countryCode(), request.mobile());
    
    if (purpose == OtpPurpose.LOGIN) {
      if (userRepository.findByMobile(mobile).isEmpty()) {
        throw new BusinessException(HttpStatus.NOT_FOUND, "User is not registered. Please sign up first.");
      }
    }

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

  @PostMapping("/refresh")
  public ApiResponse<AuthResponse> refresh(@Valid @RequestBody com.trikonekt.consumer.auth.dto.TokenRefreshRequest request) {
    return ApiResponse.ok("Token refreshed successfully", authService.refreshToken(request.refresh()));
  }

  @GetMapping("/sponsor/validate")
  public ApiResponse<java.util.Map<String, String>> validateSponsor(@RequestParam String sponsorId) {
    String name = authService.validateSponsor(sponsorId);
    if (name == null) {
      return ApiResponse.fail("Sponsor ID not recognized");
    }
    return ApiResponse.ok("Sponsor verified", java.util.Map.of("sponsorName", name));
  }

}
