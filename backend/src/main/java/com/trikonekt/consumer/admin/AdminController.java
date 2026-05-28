package com.trikonekt.consumer.admin;

import com.trikonekt.consumer.admin.dto.AdminLoginRequest;
import com.trikonekt.consumer.admin.dto.AdminLoginResponse;
import com.trikonekt.consumer.admin.dto.AdminOtpResponse;
import com.trikonekt.consumer.admin.dto.AdminSummaryResponse;
import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.user.UserRepository;
import com.trikonekt.consumer.user.dto.UserResponse;
import java.util.List;
import java.util.stream.Collectors;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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

  public AdminController(AdminService adminService, AdminRepository adminRepository, UserRepository userRepository) {
    this.adminService = adminService;
    this.adminRepository = adminRepository;
    this.userRepository = userRepository;
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
}
