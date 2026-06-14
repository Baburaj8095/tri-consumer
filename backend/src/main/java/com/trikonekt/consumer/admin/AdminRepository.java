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
    int totalUsers = count("SELECT COUNT(*) FROM accounts_customuser WHERE category = 'consumer'");
    int verifiedUsers = count("SELECT COUNT(*) FROM accounts_customuser WHERE category = 'consumer' AND is_active = TRUE");
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

  public int countAdmins() {
    return count("SELECT COUNT(*) FROM admins");
  }

  public void createAdmin(String username, String passwordHash) {
    jdbcTemplate.update("""
        INSERT INTO admins (username, password_hash)
        VALUES (?, ?)
        """, username, passwordHash);
  }

  public Optional<String> findAdminPasswordHash(String username) {
    List<String> hashes = jdbcTemplate.query("""
        SELECT password_hash FROM admins
        WHERE username = ?
        """, (rs, rowNum) -> rs.getString("password_hash"), username);
    return hashes.stream().findFirst();
  }

  public List<String> listAdmins() {
    return jdbcTemplate.query("""
        SELECT username FROM admins
        ORDER BY username ASC
        """, (rs, rowNum) -> rs.getString("username"));
  }

  public List<java.util.Map<String, Object>> listWebhookEvents() {
    return jdbcTemplate.queryForList("""
        SELECT id, idempotency_key, event_type, transaction_reference_id,
               status, x_verify, process_status, received_at, raw_body
        FROM business_hubblewebhookevent
        ORDER BY received_at DESC, id DESC
        LIMIT 100
        """);
  }

  public List<java.util.Map<String, Object>> listHubbleTransactions() {
    return jdbcTemplate.queryForList("""
        SELECT t.id, t.transaction_reference_id, t.hubble_user_id, t.user_id,
               t.status, t.amount, t.discount_amount, t.currency, t.last_event_id,
               t.created_at, t.updated_at, u.full_name as user_full_name, u.phone as user_mobile
        FROM business_hubbletransaction t
        LEFT JOIN accounts_customuser u ON t.user_id = u.id
        ORDER BY t.updated_at DESC, t.id DESC
        LIMIT 100
        """);
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
