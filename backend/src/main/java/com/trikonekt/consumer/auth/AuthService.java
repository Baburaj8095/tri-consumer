package com.trikonekt.consumer.auth;

import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.auth.dto.LoginRequest;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import com.trikonekt.consumer.common.BusinessException;
import com.trikonekt.consumer.user.User;
import com.trikonekt.consumer.user.UserRepository;
import com.trikonekt.consumer.user.dto.UserResponse;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final SessionRepository sessionRepository;
  private final HashingService hashingService;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final SecureRandom secureRandom = new SecureRandom();

  public AuthService(UserRepository userRepository, SessionRepository sessionRepository, HashingService hashingService) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
    this.hashingService = hashingService;
  }

  public AuthResponse register(RegisterRequest request) {
    String countryCode = normalizeCountryCode(request.countryCode());
    String mobile = normalizeMobile(countryCode, request.mobile());
    userRepository.findByMobile(mobile).ifPresent(user -> {
      throw new BusinessException(HttpStatus.CONFLICT, "Mobile number already registered");
    });
    if (request.email() != null && !request.email().isBlank()) {
      userRepository.findByEmail(request.email()).ifPresent(user -> {
        throw new BusinessException(HttpStatus.CONFLICT, "Email already registered");
      });
    }

    User user = userRepository.create(
        request.sponsorId(),
        request.sponsorName(),
        request.fullName().trim(),
        countryCode,
        mobile,
        request.email(),
        request.pinCode(),
        request.district(),
        request.state(),
        passwordEncoder.encode(request.password())
    );
    return createSession(user);
  }

  public AuthResponse login(LoginRequest request) {
    String username = request.username().trim();
    if (!username.contains("@")) {
      username = normalizeMobile("+91", username);
    }

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));

    if (user.passwordHash() == null || !passwordEncoder.matches(request.password(), user.passwordHash())) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }

    return createSession(user);
  }

  public AuthResponse createOtpLogin(String mobile) {
    User user = userRepository.findByMobile(mobile)
        .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "No user found for this mobile number"));
    return createSession(user);
  }

  private AuthResponse createSession(User user) {
    byte[] tokenBytes = new byte[32];
    secureRandom.nextBytes(tokenBytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    sessionRepository.create(user.id(), hashingService.tokenHash(token), Instant.now().plus(30, ChronoUnit.DAYS));
    return new AuthResponse(token, UserResponse.from(user));
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
