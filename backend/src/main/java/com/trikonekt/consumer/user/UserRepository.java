package com.trikonekt.consumer.user;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private static final Logger log = LoggerFactory.getLogger(UserRepository.class);
  private final JdbcTemplate jdbcTemplate;

  public UserRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public User create(String sponsorId, String sponsorName, String fullName, String countryCode, String mobile,
      String email, String pinCode, String district, String state, String passwordHash) {
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      var ps = connection.prepareStatement("""
          INSERT INTO users (
            sponsor_id, sponsor_name, full_name, country_code, mobile, email,
            pin_code, district, state, password_hash, mobile_verified
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
          """, new String[] {"id"});
      ps.setString(1, blankToNull(sponsorId));
      ps.setString(2, blankToNull(sponsorName));
      ps.setString(3, fullName);
      ps.setString(4, countryCode);
      ps.setString(5, mobile);
      ps.setString(6, blankToNull(email));
      ps.setString(7, blankToNull(pinCode));
      ps.setString(8, blankToNull(district));
      ps.setString(9, blankToNull(state));
      ps.setString(10, passwordHash);
      return ps;
    }, keyHolder);
    return findById(keyHolder.getKey().longValue()).orElseThrow();
  }

  private static final String SELECT_USER_SQL = """
      SELECT
        u.id, u.sponsor_id, sp.full_name AS sponsor_name, u.full_name, '+91' AS country_code,
        u.phone AS mobile, u.email, u.pincode AS pin_code, c.name AS district, st.name AS state,
        u.password AS password_hash, CASE WHEN u.is_active = TRUE THEN 'ACTIVE' ELSE 'INACTIVE' END AS status,
        TRUE AS mobile_verified, u.date_joined AS created_at,
        u.account_active, u.address,
        k.verified AS kyc_verified, k.bank_name, k.bank_account_number, k.ifsc_code, k.aadhaar_digilocker_url,
        CASE
          WHEN k.id IS NULL THEN 'UNSUBMITTED'
          WHEN k.verified = TRUE THEN 'VERIFIED'
          ELSE 'PENDING'
        END AS kyc_status
      FROM accounts_customuser u
      LEFT JOIN accounts_customuser sp ON u.sponsor_id = sp.username
      LEFT JOIN locations_city c ON u.city_id = c.id
      LEFT JOIN locations_state st ON u.state_id = st.id
      LEFT JOIN accounts_userkyc k ON u.id = k.user_id
      """;

  public Optional<User> findById(long id) {
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.id = ?", this::mapUser, id);
    return users.stream().findFirst();
  }

  public Optional<User> findByMobile(String mobile) {
    if (mobile == null || mobile.isBlank()) {
      return Optional.empty();
    }
    String digits = mobile.replaceAll("[^0-9]", "");
    String national = digits;
    String prefixed = digits;
    if (digits.length() == 10) {
      prefixed = "91" + digits;
    } else if (digits.length() == 12 && digits.startsWith("91")) {
      national = digits.substring(2);
    } else if (digits.length() > 10 && digits.startsWith("91")) {
      national = digits.substring(digits.length() - 10);
    }

    List<User> users = jdbcTemplate.query(
        SELECT_USER_SQL + " WHERE u.phone = ? OR u.phone = ?",
        this::mapUser,
        national,
        prefixed
    );
    return users.stream().findFirst();
  }

  public Optional<User> findByEmail(String email) {
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.email = ?", this::mapUser, email);
    return users.stream().findFirst();
  }

  public Optional<User> findByUsername(String username) {
    if (username == null || username.isBlank()) {
      return Optional.empty();
    }
    if (username.contains("@")) {
      return findByEmail(username);
    }
    // Try finding by mobile
    Optional<User> userOpt = findByMobile(username);
    if (userOpt.isPresent()) {
      return userOpt;
    }
    // Fallback: try finding by the actual username column
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.username = ?", this::mapUser, username);
    return users.stream().findFirst();
  }

  public List<User> findAll() {
    return jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.category = 'consumer' ORDER BY u.date_joined DESC LIMIT 500", this::mapUser);
  }

  private User mapUser(ResultSet rs, int rowNum) throws SQLException {
    Timestamp createdAt = rs.getTimestamp("created_at");
    return new User(
        rs.getLong("id"),
        rs.getString("sponsor_id"),
        rs.getString("sponsor_name"),
        rs.getString("full_name"),
        rs.getString("country_code"),
        rs.getString("mobile"),
        rs.getString("email"),
        rs.getString("pin_code"),
        rs.getString("district"),
        rs.getString("state"),
        rs.getString("password_hash"),
        rs.getString("status"),
        rs.getBoolean("mobile_verified"),
        createdAt.toInstant(),
        rs.getBoolean("account_active"),
        rs.getString("address") != null ? rs.getString("address") : "",
        rs.getString("kyc_status"),
        rs.getString("bank_name") != null ? rs.getString("bank_name") : "",
        rs.getString("bank_account_number") != null ? rs.getString("bank_account_number") : "",
        rs.getString("ifsc_code") != null ? rs.getString("ifsc_code") : "",
        rs.getString("aadhaar_digilocker_url") != null ? rs.getString("aadhaar_digilocker_url") : ""
    );
  }

  public void updateUser(long id, String email, String mobile, String pinCode, String district, String state, String status, String fullName, String address, Boolean accountActive, String kycStatus) {
    // 1. Get or create Country ID for India
    Long countryId = null;
    List<Long> countryIds = jdbcTemplate.query("SELECT id FROM locations_country WHERE UPPER(name) = 'INDIA'", (rs, rowNum) -> rs.getLong("id"));
    if (!countryIds.isEmpty()) {
      countryId = countryIds.get(0);
    } else {
      KeyHolder kh = new GeneratedKeyHolder();
      jdbcTemplate.update(conn -> {
        var ps = conn.prepareStatement("INSERT INTO locations_country (name, iso2) VALUES ('India', 'IN')", new String[]{"id"});
        return ps;
      }, kh);
      countryId = kh.getKey().longValue();
    }

    // 2. Get or create State ID
    Long stateId = null;
    if (state != null && !state.isBlank()) {
      List<Long> stateIds = jdbcTemplate.query("SELECT id FROM locations_state WHERE UPPER(name) = UPPER(?)", (rs, rowNum) -> rs.getLong("id"), state.trim());
      if (!stateIds.isEmpty()) {
        stateId = stateIds.get(0);
      } else {
        final Long cId = countryId;
        KeyHolder kh = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
          var ps = conn.prepareStatement("INSERT INTO locations_state (name, country_id) VALUES (?, ?)", new String[]{"id"});
          ps.setString(1, state.trim());
          ps.setLong(2, cId);
          return ps;
        }, kh);
        stateId = kh.getKey().longValue();
      }
    }

    // 3. Get or create City (district) ID
    Long cityId = null;
    if (district != null && !district.isBlank()) {
      List<Long> cityIds = jdbcTemplate.query("SELECT id FROM locations_city WHERE UPPER(name) = UPPER(?)", (rs, rowNum) -> rs.getLong("id"), district.trim());
      if (!cityIds.isEmpty()) {
        cityId = cityIds.get(0);
      } else {
        final Long sId = stateId;
        if (sId != null) {
          KeyHolder kh = new GeneratedKeyHolder();
          jdbcTemplate.update(conn -> {
            var ps = conn.prepareStatement("INSERT INTO locations_city (name, state_id) VALUES (?, ?)", new String[]{"id"});
            ps.setString(1, district.trim());
            ps.setLong(2, sId);
            return ps;
          }, kh);
          cityId = kh.getKey().longValue();
        }
      }
    }

    // 4. Update the user record
    boolean isActive = "ACTIVE".equalsIgnoreCase(status);
    jdbcTemplate.update("""
        UPDATE accounts_customuser
        SET email = ?, phone = ?, pincode = ?, city_id = COALESCE(?, city_id), state_id = COALESCE(?, state_id), is_active = ?, full_name = ?,
            address = COALESCE(?, address), account_active = COALESCE(?, account_active),
            username = CASE WHEN username = phone THEN ? ELSE username END
        WHERE id = ?
        """,
        blankToNull(email),
        mobile.trim(),
        blankToNull(pinCode),
        cityId,
        stateId,
        isActive,
        blankToNull(fullName),
        blankToNull(address),
        accountActive,
        mobile.trim(),
        id
    );

    // 5. Update user KYC status if provided
    if (kycStatus != null && !kycStatus.isBlank()) {
      if ("VERIFIED".equalsIgnoreCase(kycStatus)) {
        List<Long> kycIds = jdbcTemplate.query("SELECT id FROM accounts_userkyc WHERE user_id = ?", (rs, rowNum) -> rs.getLong("id"), id);
        if (kycIds.isEmpty()) {
          jdbcTemplate.update("""
              INSERT INTO accounts_userkyc (user_id, bank_name, bank_account_number, ifsc_code, verified, verified_at, kyc_reopen_allowed, aadhaar_digilocker_url, created_at, updated_at)
              VALUES (?, '', '', '', TRUE, CURRENT_TIMESTAMP, FALSE, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              """, id);
        } else {
          jdbcTemplate.update("UPDATE accounts_userkyc SET verified = TRUE, verified_at = CURRENT_TIMESTAMP, kyc_reopen_allowed = FALSE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", id);
        }
      } else if ("REJECTED".equalsIgnoreCase(kycStatus) || "REOPENED".equalsIgnoreCase(kycStatus)) {
        List<Long> kycIds = jdbcTemplate.query("SELECT id FROM accounts_userkyc WHERE user_id = ?", (rs, rowNum) -> rs.getLong("id"), id);
        if (kycIds.isEmpty()) {
          jdbcTemplate.update("""
              INSERT INTO accounts_userkyc (user_id, bank_name, bank_account_number, ifsc_code, verified, kyc_reopen_allowed, aadhaar_digilocker_url, created_at, updated_at)
              VALUES (?, '', '', '', FALSE, TRUE, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              """, id);
        } else {
          jdbcTemplate.update("UPDATE accounts_userkyc SET verified = FALSE, kyc_reopen_allowed = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", id);
        }
      }
    }
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
