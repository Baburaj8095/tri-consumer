CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  sponsor_id VARCHAR(40),
  sponsor_name VARCHAR(160),
  full_name VARCHAR(160) NOT NULL,
  country_code VARCHAR(8) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(180),
  pin_code VARCHAR(12),
  district VARCHAR(120),
  state VARCHAR(120),
  password_hash VARCHAR(120),
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_mobile (mobile),
  UNIQUE KEY uk_users_email (email)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsor_id VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sponsor_name VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_code VARCHAR(12);
ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(120);

CREATE TABLE IF NOT EXISTS otp_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  mobile VARCHAR(20) NOT NULL,
  purpose VARCHAR(32) NOT NULL,
  otp_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP NULL,
  attempts INT NOT NULL DEFAULT 0,
  provider_message_id VARCHAR(120),
  provider_response TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_otp_mobile_purpose (mobile, purpose, created_at)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sessions_token_hash (token_hash),
  KEY idx_sessions_user_id (user_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(120) NOT NULL,
  token_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admin_sessions_token_hash (token_hash),
  KEY idx_admin_sessions_username (username)
);
