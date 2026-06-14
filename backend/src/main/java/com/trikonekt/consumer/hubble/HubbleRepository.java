package com.trikonekt.consumer.hubble;

import com.trikonekt.consumer.hubble.dto.HubbleTransactionDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * DB operations for Hubble webhook events and transactions.
 * Maps directly to Django's database tables created by the 'business' app.
 */
@Repository
public class HubbleRepository {

  private final JdbcTemplate jdbc;

  public HubbleRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  // ─── Webhook Events ─────────────────────────────────────────────────────────

  /**
   * Insert a new webhook event if the idempotency key doesn't exist.
   * Returns the row id if inserted, or the existing id if duplicate.
   *
   * Maps to table: business_hubblewebhookevent
   */
  public long upsertWebhookEvent(String idempotencyKey, String eventType,
                                  String transactionReferenceId, String orderStatus,
                                  String xVerify, String rawBody) {
    // Try to find existing
    Optional<Long> existing = findWebhookEventByIdempotencyKey(idempotencyKey);
    if (existing.isPresent()) return existing.get();

    return jdbc.queryForObject(
        """
        INSERT INTO business_hubblewebhookevent
          (idempotency_key, event_type, transaction_reference_id,
           status, x_verify, raw_body, process_status, received_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
        RETURNING id
        """,
        Long.class,
        idempotencyKey, eventType, transactionReferenceId,
        orderStatus, xVerify, rawBody, Timestamp.from(Instant.now())
    );
  }

  private Optional<Long> findWebhookEventByIdempotencyKey(String key) {
    try {
      Long id = jdbc.queryForObject(
          "SELECT id FROM business_hubblewebhookevent WHERE idempotency_key = ?", Long.class, key);
      return Optional.ofNullable(id);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  // ─── Transactions ────────────────────────────────────────────────────────────

  /**
   * Upsert a HubbleTransaction from a webhook payload.
   * Maps to table: business_hubbletransaction
   */
  public void upsertTransaction(String txRef, String hubbleUserId, Long userId,
                                 String status, String amount, String discountAmount,
                                 String currency, long webhookEventId) {
    int updated = jdbc.update(
        """
        UPDATE business_hubbletransaction
           SET status        = CASE
                 WHEN status = 'REVERSED' THEN status
                 WHEN ? = 'REVERSED'      THEN ?
                 WHEN status = 'COMPLETED' AND ? != 'REVERSED' THEN status
                 ELSE ?
               END,
               amount              = COALESCE(NULLIF(?, ''), amount::TEXT)::NUMERIC,
               discount_amount     = COALESCE(NULLIF(?, ''), discount_amount::TEXT)::NUMERIC,
               currency            = COALESCE(NULLIF(?, ''), currency),
               last_event_id       = ?,
               updated_at          = NOW()
         WHERE transaction_reference_id = ?
        """,
        status, status, status, status,
        amount, discountAmount, currency,
        webhookEventId, txRef
    );

    if (updated == 0) {
      jdbc.update(
          """
          INSERT INTO business_hubbletransaction
            (transaction_reference_id, hubble_user_id, user_id, status,
             amount, discount_amount, currency, last_event_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, NULLIF(?, '')::NUMERIC, NULLIF(?, '')::NUMERIC, ?, ?, NOW(), NOW())
          """,
          txRef, hubbleUserId, userId, status,
          amount, discountAmount, currency, webhookEventId
      );
    }
  }

  /**
   * List the last N transactions for a user.
   * Maps to table: business_hubbletransaction
   */
  public List<HubbleTransactionDto> findTransactionsByUserId(long userId, int limit) {
    return jdbc.query(
        """
        SELECT transaction_reference_id, status, amount, discount_amount,
               currency, created_at, updated_at
          FROM business_hubbletransaction
         WHERE user_id = ?
         ORDER BY updated_at DESC, id DESC
         LIMIT ?
         """,
        (rs, row) -> new HubbleTransactionDto(
            rs.getString("transaction_reference_id"),
            rs.getString("status"),
            rs.getString("amount"),
            rs.getString("discount_amount"),
            rs.getString("currency"),
            rs.getTimestamp("updated_at") != null ? rs.getTimestamp("updated_at").toInstant().toString() : null,
            rs.getTimestamp("created_at") != null ? rs.getTimestamp("created_at").toInstant().toString() : null
        ),
        userId, limit
    );
  }

  /**
   * Find user_id by hubble_user_id (the "sub" claim from SSO JWT).
   * Maps to table: accounts_customuser
   */
  public Optional<Long> findUserIdByHubbleSubject(String subject) {
    if (subject == null || subject.isBlank()) return Optional.empty();
    try {
      // subject is our user's DB id as string (matches Django's generate_hubble_sso_jwt sub=str(user.id))
      Long id = jdbc.queryForObject(
          "SELECT id FROM accounts_customuser WHERE id = ?", Long.class,
          Long.parseLong(subject.trim())
      );
      return Optional.ofNullable(id);
    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
