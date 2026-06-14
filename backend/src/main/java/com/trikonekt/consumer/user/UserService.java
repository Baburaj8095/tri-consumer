package com.trikonekt.consumer.user;

import com.trikonekt.consumer.auth.DjangoAuthClient;
import com.trikonekt.consumer.user.dto.UserResponse;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private final DjangoAuthClient djangoAuthClient;

  public UserService(DjangoAuthClient djangoAuthClient) {
    this.djangoAuthClient = djangoAuthClient;
  }

  public UserResponse currentUser(String authorizationHeader) {
    return djangoAuthClient.me(authorizationHeader);
  }
}
