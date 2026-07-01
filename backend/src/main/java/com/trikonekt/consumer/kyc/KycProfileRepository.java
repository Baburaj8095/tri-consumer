package com.trikonekt.consumer.kyc;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class KycProfileRepository {

    private final JdbcTemplate jdbcTemplate;

    public KycProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<KycProfile> findByUserId(long userId) {
        String sql = "SELECT * FROM kyc_profile WHERE user_id = ?";
        try {
            KycProfile profile = jdbcTemplate.queryForObject(sql, this::mapRow, userId);
            return Optional.ofNullable(profile);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<KycProfile> findByState(String state) {
        String sql = "SELECT * FROM kyc_profile WHERE state = ?";
        try {
            KycProfile profile = jdbcTemplate.queryForObject(sql, this::mapRow, state);
            return Optional.ofNullable(profile);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<KycProfile> findById(long id) {
        String sql = "SELECT * FROM kyc_profile WHERE id = ?";
        try {
            KycProfile profile = jdbcTemplate.queryForObject(sql, this::mapRow, id);
            return Optional.ofNullable(profile);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void save(KycProfile p) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM kyc_profile WHERE user_id = ?", Integer.class, p.getUserId());
        boolean exists = count != null && count > 0;

        if (exists) {
            String sql = """
                UPDATE kyc_profile SET
                    status = ?, digilocker_id = ?, access_token_encrypted = ?, refresh_token_encrypted = ?,
                    name = ?, dob = ?, gender = ?, email = ?, mobile = ?, address = ?, photo = ?,
                    aadhaar_last4 = ?, pan_number = ?, issued_documents_json = ?, state = ?, remarks = ?,
                    verified_at = ?, verified_by_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """;
            jdbcTemplate.update(sql,
                p.getStatus(), p.getDigilockerId(), p.getAccessTokenEncrypted(), p.getRefreshTokenEncrypted(),
                p.getName(), p.getDob(), p.getGender(), p.getEmail(), p.getMobile(), p.getAddress(), p.getPhoto(),
                p.getAadhaarLast4(), p.getPanNumber(), p.getIssuedDocumentsJson(), p.getState(), p.getRemarks(),
                p.getVerifiedAt() != null ? Timestamp.from(p.getVerifiedAt()) : null, p.getVerifiedById(),
                p.getUserId()
            );
        } else {
            String sql = """
                INSERT INTO kyc_profile (
                    user_id, status, digilocker_id, access_token_encrypted, refresh_token_encrypted,
                    name, dob, gender, email, mobile, address, photo, aadhaar_last4, pan_number,
                    issued_documents_json, state, remarks, verified_at, verified_by_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;
            jdbcTemplate.update(sql,
                p.getUserId(), p.getStatus(), p.getDigilockerId(), p.getAccessTokenEncrypted(), p.getRefreshTokenEncrypted(),
                p.getName(), p.getDob(), p.getGender(), p.getEmail(), p.getMobile(), p.getAddress(), p.getPhoto(),
                p.getAadhaarLast4(), p.getPanNumber(), p.getIssuedDocumentsJson(), p.getState(), p.getRemarks(),
                p.getVerifiedAt() != null ? Timestamp.from(p.getVerifiedAt()) : null, p.getVerifiedById()
            );
        }
    }

    public void syncToLegacyTables(long userId, String status, Long adminId) {
        boolean verified = "VERIFIED".equalsIgnoreCase(status);

        // 1. Sync to accounts_userkyc (Withdrawals)
        List<Long> kycIds = jdbcTemplate.query("SELECT id FROM accounts_userkyc WHERE user_id = ?", (rs, rowNum) -> rs.getLong("id"), userId);
        if (kycIds.isEmpty()) {
            jdbcTemplate.update("""
                INSERT INTO accounts_userkyc (user_id, bank_name, bank_account_number, ifsc_code, verified, verified_at, kyc_reopen_allowed, aadhaar_digilocker_url, created_at, updated_at)
                VALUES (?, '', '', '', ?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, userId, verified, verified ? Timestamp.from(Instant.now()) : null, !verified);
        } else {
            jdbcTemplate.update("""
                UPDATE accounts_userkyc
                SET verified = ?, verified_at = ?, kyc_reopen_allowed = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
                """, verified, verified ? Timestamp.from(Instant.now()) : null, !verified, userId);
        }

        // 2. Sync to market_merchantprofile (Marketplace products)
        List<Long> merchantIds = jdbcTemplate.query("SELECT id FROM market_merchantprofile WHERE user_id = ?", (rs, rowNum) -> rs.getLong("id"), userId);
        if (!merchantIds.isEmpty()) {
            jdbcTemplate.update("UPDATE market_merchantprofile SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?", verified, userId);
        }

        // 3. Sync to accounts_customuser (Agency Unlock / Activation)
        if (verified) {
            List<Map<String, Object>> users = jdbcTemplate.queryForList("SELECT role, category FROM accounts_customuser WHERE id = ? LIMIT 1", userId);
            if (!users.isEmpty()) {
                String role = (String) users.get(0).get("role");
                String category = (String) users.get(0).get("category");
                boolean isAgency = "agency".equalsIgnoreCase(role) || (category != null && category.startsWith("agency_"));

                if (isAgency) {
                    jdbcTemplate.update("""
                        UPDATE accounts_customuser
                        SET is_agency_unlocked = TRUE, account_active = TRUE
                        WHERE id = ?
                        """, userId);
                }
            }
        }
    }

    public List<Map<String, Object>> findAllForAdmin(String search, String status, int limit, int offset) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                p.user_id,
                u.username,
                u.full_name,
                u.phone,
                u.pincode,
                u.category,
                k.bank_name,
                k.bank_account_number,
                k.ifsc_code,
                CASE WHEN p.status = 'VERIFIED' THEN TRUE ELSE FALSE END as verified,
                p.status,
                p.name as kyc_name,
                p.dob,
                p.gender,
                p.email as kyc_email,
                p.mobile as kyc_mobile,
                p.address as kyc_address,
                p.photo,
                p.aadhaar_last4,
                p.pan_number,
                p.issued_documents_json,
                p.remarks,
                p.verified_at,
                p.created_at,
                p.updated_at
            FROM kyc_profile p
            JOIN accounts_customuser u ON p.user_id = u.id
            LEFT JOIN accounts_userkyc k ON p.user_id = k.user_id
            WHERE 1=1
            """);

        List<Object> params = new java.util.ArrayList<>();
        if (status != null && !status.isEmpty()) {
            sql.append(" AND p.status = ?");
            params.add(status);
        }
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (p.name LIKE ? OR u.username LIKE ? OR p.mobile LIKE ? OR p.email LIKE ?)");
            String wrap = "%" + search + "%";
            params.add(wrap);
            params.add(wrap);
            params.add(wrap);
            params.add(wrap);
        }

        sql.append(" ORDER BY p.updated_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    public int countForAdmin(String search, String status) {
        StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*)
            FROM kyc_profile p
            JOIN accounts_customuser u ON p.user_id = u.id
            WHERE 1=1
            """);

        List<Object> params = new java.util.ArrayList<>();
        if (status != null && !status.isEmpty()) {
            sql.append(" AND p.status = ?");
            params.add(status);
        }
        if (search != null && !search.isEmpty()) {
            sql.append(" AND (p.name LIKE ? OR u.username LIKE ? OR p.mobile LIKE ? OR p.email LIKE ?)");
            String wrap = "%" + search + "%";
            params.add(wrap);
            params.add(wrap);
            params.add(wrap);
            params.add(wrap);
        }

        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    public Map<String, Object> getStatistics() {
        String sql = """
            SELECT
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 ELSE 0 END) as today
            FROM kyc_profile
            """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        if (rows.isEmpty()) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("pending", 0);
            fallback.put("verified", 0);
            fallback.put("rejected", 0);
            fallback.put("today", 0);
            return fallback;
        }
        return rows.get(0);
    }

    public Long getUserIdByUsername(String username) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM accounts_customuser WHERE username = ?", Long.class, username);
        } catch (Exception e) {
            return null;
        }
    }

    public String getUserCategory(long userId) {
        try {
            return jdbcTemplate.queryForObject("SELECT category FROM accounts_customuser WHERE id = ?", String.class, userId);
        } catch (Exception e) {
            return "consumer";
        }
    }

    public String getUserRole(long userId) {
        try {
            return jdbcTemplate.queryForObject("SELECT role FROM accounts_customuser WHERE id = ?", String.class, userId);
        } catch (Exception e) {
            return "user";
        }
    }

    private KycProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
        KycProfile p = new KycProfile();
        p.setId(rs.getLong("id"));
        p.setUserId(rs.getLong("user_id"));
        p.setStatus(rs.getString("status"));
        p.setDigilockerId(rs.getString("digilocker_id"));
        p.setAccessTokenEncrypted(rs.getString("access_token_encrypted"));
        p.setRefreshTokenEncrypted(rs.getString("refresh_token_encrypted"));
        p.setName(rs.getString("name"));
        p.setDob(rs.getString("dob"));
        p.setGender(rs.getString("gender"));
        p.setEmail(rs.getString("email"));
        p.setMobile(rs.getString("mobile"));
        p.setAddress(rs.getString("address"));
        p.setPhoto(rs.getString("photo"));
        p.setAadhaarLast4(rs.getString("aadhaar_last4"));
        p.setPanNumber(rs.getString("pan_number"));
        p.setIssuedDocumentsJson(rs.getString("issued_documents_json"));
        p.setState(rs.getString("state"));
        p.setRemarks(rs.getString("remarks"));
        Timestamp verifiedAt = rs.getTimestamp("verified_at");
        p.setVerifiedAt(verifiedAt != null ? verifiedAt.toInstant() : null);
        long vById = rs.getLong("verified_by_id");
        p.setVerifiedById(rs.wasNull() ? null : vById);
        p.setCreatedAt(rs.getTimestamp("created_at").toInstant());
        p.setUpdatedAt(rs.getTimestamp("updated_at").toInstant());
        return p;
    }
}
