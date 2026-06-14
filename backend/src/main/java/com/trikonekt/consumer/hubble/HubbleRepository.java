package com.trikonekt.consumer.hubble;

import com.trikonekt.consumer.hubble.dto.HubbleTransactionDto;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

  // ─── Coins / Wallet Integration ─────────────────────────────────────────────

  /**
   * Get the available wallet balance of a user.
   */
  public Optional<Double> getUserBalance(long userId) {
    try {
      Double balance = jdbc.queryForObject(
          "SELECT balance FROM accounts_wallet WHERE user_id = ?",
          Double.class,
          userId
      );
      return Optional.ofNullable(balance);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  /**
   * Get the balance_after of an existing transaction for idempotency checks.
   */
  public Optional<Double> getTransactionBalanceAfter(String sourceType, String sourceId) {
    try {
      Double balanceAfter = jdbc.queryForObject(
          "SELECT balance_after FROM accounts_wallettransaction WHERE source_type = ? AND source_id = ?",
          Double.class,
          sourceType,
          sourceId
      );
      return Optional.ofNullable(balanceAfter);
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  /**
   * Find the absolute amount of the original debit transaction for a reversal.
   */
  public Optional<Double> findOriginalDebitAmount(String sourceId, long userId) {
    try {
      Double amount = jdbc.queryForObject(
          "SELECT amount FROM accounts_wallettransaction WHERE source_type = 'HUBBLE_DEBIT' AND source_id = ? AND user_id = ?",
          Double.class,
          sourceId,
          userId
      );
      if (amount != null) {
        return Optional.of(Math.abs(amount));
      }
      return Optional.empty();
    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();
    }
  }

  /**
   * Debit the user's wallet with pessimistic locking.
   * Throws IllegalArgumentException("INSUFFICIENT_BALANCE") if insufficient funds.
   */
  @Transactional
  public double debitWalletBalance(long userId, double amount, String referenceId, String note) {
    Map<String, Object> wallet = jdbc.queryForMap(
        "SELECT main_balance, withdrawable_balance, balance FROM accounts_wallet WHERE user_id = ? FOR UPDATE",
        userId
    );
    double mainBalance = ((Number) wallet.get("main_balance")).doubleValue();
    double withdrawableBalance = ((Number) wallet.get("withdrawable_balance")).doubleValue();
    double balance = ((Number) wallet.get("balance")).doubleValue();

    if (balance < amount) {
      throw new IllegalArgumentException("INSUFFICIENT_BALANCE");
    }

    double takeMain = Math.min(mainBalance, amount);
    double rem = amount - takeMain;
    if (withdrawableBalance < rem) {
      throw new IllegalArgumentException("INSUFFICIENT_BALANCE");
    }

    double newMain = mainBalance - takeMain;
    double newWd = withdrawableBalance - rem;
    double newBalance = balance - amount;

    // Update wallet
    jdbc.update(
        "UPDATE accounts_wallet SET main_balance = ?, withdrawable_balance = ?, balance = ?, updated_at = NOW() WHERE user_id = ?",
        newMain, newWd, newBalance, userId
    );

    // Insert transaction
    String escapedNote = note != null ? note.replace("\"", "\\\"") : "";
    jdbc.update(
        "INSERT INTO accounts_wallettransaction (user_id, amount, balance_after, type, source_type, source_id, meta, created_at) " +
        "VALUES (?, ?, ?, 'VOUCHER_CREATE_DEBIT', 'HUBBLE_DEBIT', ?, ?, NOW())",
        userId, -amount, newBalance, referenceId, "{\"note\":\"" + escapedNote + "\"}"
    );

    return newBalance;
  }

  /**
   * Credit the user's wallet (refund) with pessimistic locking.
   */
  @Transactional
  public double creditWalletBalance(long userId, double amount, String referenceId, String note) {
    Map<String, Object> wallet = jdbc.queryForMap(
        "SELECT main_balance, balance FROM accounts_wallet WHERE user_id = ? FOR UPDATE",
        userId
    );
    double mainBalance = ((Number) wallet.get("main_balance")).doubleValue();
    double balance = ((Number) wallet.get("balance")).doubleValue();

    double newMain = mainBalance + amount;
    double newBalance = balance + amount;

    // Update wallet
    jdbc.update(
        "UPDATE accounts_wallet SET main_balance = ?, balance = ?, updated_at = NOW() WHERE user_id = ?",
        newMain, newBalance, userId
    );

    // Insert transaction
    String escapedNote = note != null ? note.replace("\"", "\\\"") : "";
    jdbc.update(
        "INSERT INTO accounts_wallettransaction (user_id, amount, balance_after, type, source_type, source_id, meta, created_at) " +
        "VALUES (?, ?, ?, 'VOUCHER_REDEEM_CREDIT', 'HUBBLE_REVERSAL', ?, ?, NOW())",
        userId, amount, newBalance, referenceId, "{\"note\":\"" + escapedNote + "\"}"
    );

    return newBalance;
  }
}
