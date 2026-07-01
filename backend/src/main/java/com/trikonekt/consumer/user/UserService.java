package com.trikonekt.consumer.user;

import com.trikonekt.consumer.auth.DjangoAuthClient;
import com.trikonekt.consumer.user.dto.UserResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class UserService {
  private final DjangoAuthClient djangoAuthClient;
  private final UserRepository userRepository;
  private final SecretKey secretKey;

  public UserService(
      DjangoAuthClient djangoAuthClient,
      UserRepository userRepository,
      @Value("${jwt.secret:replace-this-with-a-real-secret-in-prod}") String secret
  ) {
    this.djangoAuthClient = djangoAuthClient;
    this.userRepository = userRepository;

    byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    if (keyBytes.length < 32) {
      byte[] padded = new byte[32];
      System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
      keyBytes = padded;
    }
    this.secretKey = Keys.hmacShaKeyFor(keyBytes);
  }

  public UserResponse currentUser(String authorizationHeader) {
    if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
      String token = authorizationHeader.substring(7);
      try {
        // Attempt to parse/verify as a locally signed Captain/Business JWT token
        Claims claims = Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();

        String username = claims.getSubject();
        if (username != null && !username.isBlank()) {
          Optional<User> userOpt = userRepository.findByUsername(username);
          if (userOpt.isPresent()) {
            return UserResponse.from(userOpt.get());
          }
        }
      } catch (Exception e) {
        // Fallback to standard Django authentication if local signature check fails
      }
    }
    return djangoAuthClient.me(authorizationHeader);
  }
}
