package com.trikonekt.consumer.auth;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SessionRepository {
  private final JdbcTemplate jdbcTemplate;

  public SessionRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void create(long userId, String tokenHash, Instant expiresAt) {
    jdbcTemplate.update("""
        INSERT INTO user_sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
        """, userId, tokenHash, Timestamp.from(expiresAt));
  }

  public Optional<Long> findActiveUserId(String tokenHash) {
    List<Long> userIds = jdbcTemplate.query("""
        SELECT user_id FROM user_sessions
        WHERE token_hash = ?
          AND revoked_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        """, (rs, rowNum) -> rs.getLong("user_id"), tokenHash);
    return userIds.stream().findFirst();
  }
}

