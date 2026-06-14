package com.trikonekt.consumer.user;

import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.user.dto.UserResponse;
import com.trikonekt.consumer.auth.DjangoAuthClient;
import com.trikonekt.consumer.common.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService userService;
  private final UserRepository userRepository;
  private final DjangoAuthClient djangoAuthClient;

  public UserController(UserService userService, UserRepository userRepository, DjangoAuthClient djangoAuthClient) {
    this.userService = userService;
    this.userRepository = userRepository;
    this.djangoAuthClient = djangoAuthClient;
  }

  @GetMapping("/me")
  public ApiResponse<UserResponse> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
    return ApiResponse.ok("Current user", userService.currentUser(authorization));
  }

  @PutMapping("/profile")
  public ApiResponse<UserResponse> updateProfile(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody Map<String, Object> request) {
    UserResponse currentUser = userService.currentUser(authorization);
    long userId = currentUser.getId();

    String email = (String) request.get("email");
    String mobile = (String) request.get("mobile");
    String pinCode = (String) request.get("pinCode");
    String district = (String) request.get("district");
    String state = (String) request.get("state");
    String fullName = (String) request.get("fullName");
    String address = (String) request.get("address");

    if (mobile == null || mobile.isBlank()) {
      mobile = currentUser.getMobile();
    }

    userRepository.updateUser(
        userId,
        email,
        mobile,
        pinCode,
        district,
        state,
        currentUser.getStatus(),
        fullName,
        address,
        currentUser.getAccountActive(),
        null
    );

    return ApiResponse.ok("Profile updated successfully", userService.currentUser(authorization));
  }

  @PostMapping("/change-password")
  public ApiResponse<Void> changePassword(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody Map<String, String> request) {
    UserResponse currentUser = userService.currentUser(authorization);
    String newPassword = request.get("password");
    if (newPassword == null || newPassword.isBlank()) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Password cannot be blank");
    }

    djangoAuthClient.changePassword(currentUser.getMobile(), newPassword);
    return ApiResponse.ok("Password changed successfully", null);
  }
}
