package com.trikonekt.consumer.user;

import com.trikonekt.consumer.auth.HashingService;
import com.trikonekt.consumer.auth.SessionRepository;
import com.trikonekt.consumer.common.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class UserService {
  private final SessionRepository sessionRepository;
  private final UserRepository userRepository;
  private final HashingService hashingService;

  public UserService(SessionRepository sessionRepository, UserRepository userRepository, HashingService hashingService) {
    this.sessionRepository = sessionRepository;
    this.userRepository = userRepository;
    this.hashingService = hashingService;
  }

  public User currentUser(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
    }
    String token = authorizationHeader.substring("Bearer ".length()).trim();
    Long userId = sessionRepository.findActiveUserId(hashingService.tokenHash(token))
        .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid or expired token"));
    return userRepository.findById(userId)
        .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
  }
}

