package com.trikonekt.consumer.admin;

import com.trikonekt.consumer.admin.dto.AdminOtpResponse;
import com.trikonekt.consumer.admin.dto.AdminSummaryResponse;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminRepository {
  private final JdbcTemplate jdbcTemplate;

  public AdminRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void createSession(String username, String tokenHash, Instant expiresAt) {
    jdbcTemplate.update("""
        INSERT INTO admin_sessions (username, token_hash, expires_at)
        VALUES (?, ?, ?)
        """, username, tokenHash, Timestamp.from(expiresAt));
  }

  public Optional<String> findActiveAdminUsername(String tokenHash) {
    List<String> usernames = jdbcTemplate.query("""
        SELECT username FROM admin_sessions
        WHERE token_hash = ?
          AND revoked_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        """, (rs, rowNum) -> rs.getString("username"), tokenHash);
    return usernames.stream().findFirst();
  }

  public AdminSummaryResponse summary() {
    int totalUsers = count("SELECT COUNT(*) FROM users");
    int verifiedUsers = count("SELECT COUNT(*) FROM users WHERE mobile_verified = TRUE");
    int otpRequests = count("SELECT COUNT(*) FROM otp_requests");
    int consumedOtps = count("SELECT COUNT(*) FROM otp_requests WHERE consumed_at IS NOT NULL");
    return new AdminSummaryResponse(totalUsers, verifiedUsers, otpRequests, consumedOtps);
  }

  public List<AdminOtpResponse> listOtpRequests() {
    return jdbcTemplate.query("""
        SELECT id, mobile, purpose, expires_at, consumed_at, attempts, provider_message_id, provider_response, created_at
        FROM otp_requests
        ORDER BY created_at DESC
        LIMIT 200
        """, this::mapOtp);
  }

  private int count(String sql) {
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
    return count == null ? 0 : count;
  }

  private AdminOtpResponse mapOtp(ResultSet rs, int rowNum) throws SQLException {
    Timestamp consumedAt = rs.getTimestamp("consumed_at");
    return new AdminOtpResponse(
        rs.getLong("id"),
        rs.getString("mobile"),
        rs.getString("purpose"),
        rs.getTimestamp("expires_at").toInstant(),
        consumedAt == null ? null : consumedAt.toInstant(),
        rs.getInt("attempts"),
        rs.getString("provider_message_id"),
        rs.getString("provider_response"),
        rs.getTimestamp("created_at").toInstant()
    );
  }
}
