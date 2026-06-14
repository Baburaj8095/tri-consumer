package com.trikonekt.consumer.user;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
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

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
