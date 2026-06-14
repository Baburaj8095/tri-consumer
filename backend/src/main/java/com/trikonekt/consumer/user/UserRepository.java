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
        TRUE AS mobile_verified, u.date_joined AS created_at
      FROM accounts_customuser u
      LEFT JOIN accounts_customuser sp ON u.sponsor_id = sp.username
      LEFT JOIN locations_city c ON u.city_id = c.id
      LEFT JOIN locations_state st ON u.state_id = st.id
      """;

  public Optional<User> findById(long id) {
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.id = ?", this::mapUser, id);
    return users.stream().findFirst();
  }

  public Optional<User> findByMobile(String mobile) {
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.phone = ?", this::mapUser, mobile);
    return users.stream().findFirst();
  }

  public Optional<User> findByEmail(String email) {
    List<User> users = jdbcTemplate.query(SELECT_USER_SQL + " WHERE u.email = ?", this::mapUser, email);
    return users.stream().findFirst();
  }

  public Optional<User> findByUsername(String username) {
    return username.contains("@") ? findByEmail(username) : findByMobile(username);
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
        createdAt.toInstant()
    );
  }

  public void updateUser(long id, String email, String mobile, String pinCode, String district, String state, String status, String fullName) {
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
        SET email = ?, phone = ?, pincode = ?, city_id = ?, state_id = ?, is_active = ?, full_name = ?,
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
        mobile.trim(),
        id
    );
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
