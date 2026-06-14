package com.trikonekt.consumer.admin;

import com.trikonekt.consumer.admin.dto.AdminCreateRequest;
import com.trikonekt.consumer.admin.dto.AdminLoginRequest;
import com.trikonekt.consumer.admin.dto.AdminLoginResponse;
import com.trikonekt.consumer.admin.dto.AdminOtpResponse;
import com.trikonekt.consumer.admin.dto.AdminSummaryResponse;
import com.trikonekt.consumer.auth.AuthService;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.user.UserRepository;
import com.trikonekt.consumer.user.dto.UserResponse;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;
  private final AdminRepository adminRepository;
  private final UserRepository userRepository;
  private final AuthService authService;
  private final com.trikonekt.consumer.hubble.HubbleConfig hubbleConfig;

  public AdminController(AdminService adminService, AdminRepository adminRepository,
      UserRepository userRepository, AuthService authService,
      com.trikonekt.consumer.hubble.HubbleConfig hubbleConfig) {
    this.adminService = adminService;
    this.adminRepository = adminRepository;
    this.userRepository = userRepository;
    this.authService = authService;
    this.hubbleConfig = hubbleConfig;
  }

  @PostMapping("/login")
  public ApiResponse<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
    return ApiResponse.ok("Admin login successful", adminService.login(request));
  }

  @GetMapping("/summary")
  public ApiResponse<AdminSummaryResponse> summary(@RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    return ApiResponse.ok("Admin summary", adminRepository.summary());
  }

  @GetMapping("/users")
  public ApiResponse<List<UserResponse>> users(@RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    List<UserResponse> users = userRepository.findAll().stream()
        .map(UserResponse::from)
        .collect(Collectors.toList());
    return ApiResponse.ok("Registered users", users);
  }

  @GetMapping("/otps")
  public ApiResponse<List<AdminOtpResponse>> otps(@RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    return ApiResponse.ok("OTP requests", adminRepository.listOtpRequests());
  }

  @PostMapping("/admins")
  public ApiResponse<String> createAdmin(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @Valid @RequestBody AdminCreateRequest request) {
    adminService.requireAdmin(authorization);
    adminService.createAdmin(request.username(), request.password());
    return ApiResponse.ok("Administrator created successfully", request.username());
  }

  @GetMapping("/admins")
  public ApiResponse<List<String>> listAdmins(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    return ApiResponse.ok("Administrator list", adminRepository.listAdmins());
  }

  @PostMapping("/users")
  public ApiResponse<UserResponse> createUser(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @Valid @RequestBody RegisterRequest request) {
    adminService.requireAdmin(authorization);
    AuthResponse response = authService.register(request);
    return ApiResponse.ok("User created successfully by administrator", response.getUser());
  }
 
  @GetMapping("/hubble/webhooks")
  public ApiResponse<List<Map<String, Object>>> webhooks(@RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    return ApiResponse.ok("Hubble webhook events", adminRepository.listWebhookEvents());
  }
 
  @GetMapping("/hubble/transactions")
  public ApiResponse<List<Map<String, Object>>> hubbleTransactions(@RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    return ApiResponse.ok("Hubble transactions", adminRepository.listHubbleTransactions());
  }
 
  @GetMapping("/hubble/config")
  public ApiResponse<Map<String, Object>> hubbleConfig(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    adminService.requireAdmin(authorization);
    String secret = hubbleConfig.getWebhookSecret();
    String masked = secret.length() > 8 ? secret.substring(0, 4) + "****" + secret.substring(secret.length() - 4) : "****";
    return ApiResponse.ok("Hubble configuration status", Map.of(
        "clientId", hubbleConfig.getClientId(),
        "sdkBaseUrl", hubbleConfig.getSdkBaseUrl(),
        "webhookSecret", masked,
        "isConfigured", hubbleConfig.isConfigured()
    ));
  }

  @PutMapping("/users/{id}")
  public ApiResponse<Void> updateUser(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") long id,
      @Valid @RequestBody UserUpdateRequest request) {
    adminService.requireAdmin(authorization);
    userRepository.updateUser(id, request.email(), request.mobile(), request.pinCode(), request.district(), request.state(), request.status(), request.fullName(), request.address(), request.accountActive(), request.kycStatus());
    return ApiResponse.ok("User updated successfully", null);
  }

  public record UserUpdateRequest(
      String email,
      String mobile,
      String pinCode,
      String district,
      String state,
      String status,
      String fullName,
      String address,
      Boolean accountActive,
      String kycStatus
  ) {}
}
