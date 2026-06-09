package com.trikonekt.consumer.admin;

import com.trikonekt.consumer.admin.dto.AdminLoginRequest;
import com.trikonekt.consumer.admin.dto.AdminLoginResponse;
import com.trikonekt.consumer.auth.HashingService;
import com.trikonekt.consumer.common.BusinessException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
  private final AdminRepository adminRepository;
  private final HashingService hashingService;
  private final SecureRandom secureRandom = new SecureRandom();
  private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder =
      new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

  public AdminService(AdminRepository adminRepository, HashingService hashingService) {
    this.adminRepository = adminRepository;
    this.hashingService = hashingService;
  }

  public AdminLoginResponse login(AdminLoginRequest request) {
    String username = request.username().trim();
    String passwordHash = adminRepository.findAdminPasswordHash(username)
        .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials"));

    if (!passwordEncoder.matches(request.password(), passwordHash)) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
    }

    byte[] tokenBytes = new byte[32];
    secureRandom.nextBytes(tokenBytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    adminRepository.createSession(username, hashingService.adminTokenHash(token), Instant.now().plus(12, ChronoUnit.HOURS));
    return new AdminLoginResponse(token, username);
  }

  public void createAdmin(String username, String password) {
    if (username == null || username.isBlank() || password == null || password.isBlank()) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Username and password cannot be blank");
    }
    String normalized = username.trim().toLowerCase();
    if (adminRepository.findAdminPasswordHash(normalized).isPresent()) {
      throw new BusinessException(HttpStatus.CONFLICT, "Admin username already exists");
    }
    adminRepository.createAdmin(normalized, passwordEncoder.encode(password));
  }

  public String requireAdmin(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Missing admin token");
    }
    String token = authorizationHeader.substring("Bearer ".length()).trim();
    return adminRepository.findActiveAdminUsername(hashingService.adminTokenHash(token))
        .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Invalid or expired admin token"));
  }
}

