package com.trikonekt.consumer.user;

import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.user.dto.UserResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public ApiResponse<UserResponse> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
    return ApiResponse.ok("Current user", UserResponse.from(userService.currentUser(authorization)));
  }
}

