package com.trikonekt.consumer.auth;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OtpRepository {
  private final JdbcTemplate jdbcTemplate;

  public OtpRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void create(String mobile, OtpPurpose purpose, String otpHash, Instant expiresAt, String providerResponse) {
    jdbcTemplate.update("""
        INSERT INTO otp_requests (mobile, purpose, otp_hash, expires_at, provider_response)
        VALUES (?, ?, ?, ?, ?)
        """, mobile, purpose.name(), otpHash, Timestamp.from(expiresAt), providerResponse);
  }

  public int countRecent(String mobile, OtpPurpose purpose, Instant since) {
    Integer count = jdbcTemplate.queryForObject("""
        SELECT COUNT(*) FROM otp_requests
        WHERE mobile = ? AND purpose = ? AND created_at >= ?
        """, Integer.class, mobile, purpose.name(), Timestamp.from(since));
    return count == null ? 0 : count;
  }

  public Optional<OtpRecord> findLatestUsable(String mobile, OtpPurpose purpose) {
    List<OtpRecord> records = jdbcTemplate.query("""
        SELECT * FROM otp_requests
        WHERE mobile = ?
          AND purpose = ?
          AND consumed_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        ORDER BY created_at DESC
        LIMIT 1
        """, this::mapOtp, mobile, purpose.name());
    return records.stream().findFirst();
  }

  public void incrementAttempts(long id) {
    jdbcTemplate.update("UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?", id);
  }

  public void markConsumed(long id) {
    jdbcTemplate.update("UPDATE otp_requests SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?", id);
  }

  private OtpRecord mapOtp(ResultSet rs, int rowNum) throws SQLException {
    return new OtpRecord(
        rs.getLong("id"),
        rs.getString("mobile"),
        OtpPurpose.valueOf(rs.getString("purpose")),
        rs.getString("otp_hash"),
        rs.getTimestamp("expires_at").toInstant(),
        rs.getInt("attempts")
    );
  }
}

