CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_id TEXT,
  sponsor_name TEXT,
  full_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  pin_code TEXT,
  district TEXT,
  state TEXT,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  mobile_verified INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile TEXT NOT NULL,
  purpose TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  consumed_at TIMESTAMP NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  provider_message_id TEXT,
  provider_response TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_mobile_purpose ON otp_requests (mobile, purpose, created_at);

CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions (user_id);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_username ON admin_sessions (username);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_profile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  digilocker_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  name TEXT,
  dob TEXT,
  gender TEXT,
  email TEXT,
  mobile TEXT,
  address TEXT,
  photo TEXT,
  aadhaar_last4 TEXT,
  pan_number TEXT,
  issued_documents_json TEXT,
  state TEXT,
  remarks TEXT,
  verified_at TIMESTAMP,
  verified_by_id INTEGER,
  code_verifier TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Django / Shared compatibility tables
CREATE TABLE IF NOT EXISTS accounts_customuser (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_id TEXT,
  full_name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  pincode TEXT,
  city_id INTEGER,
  state_id INTEGER,
  password TEXT,
  is_active INTEGER DEFAULT 1,
  date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  account_active INTEGER DEFAULT 1,
  address TEXT,
  category TEXT DEFAULT 'consumer',
  username TEXT UNIQUE,
  role TEXT DEFAULT 'USER'
);

CREATE TABLE IF NOT EXISTS accounts_userkyc (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  bank_name TEXT,
  bank_account_number TEXT,
  ifsc_code TEXT,
  verified INTEGER DEFAULT 0,
  verified_at TIMESTAMP,
  kyc_reopen_allowed INTEGER DEFAULT 0,
  aadhaar_digilocker_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations_country (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  iso2 TEXT
);

CREATE TABLE IF NOT EXISTS locations_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  country_id INTEGER
);

CREATE TABLE IF NOT EXISTS locations_city (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  state_id INTEGER
);

CREATE TABLE IF NOT EXISTS accounts_wallet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  main_balance NUMERIC DEFAULT 0,
  withdrawable_balance NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS accounts_wallettransaction (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  source_type TEXT,
  source_id TEXT,
  amount NUMERIC,
  balance_after NUMERIC,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_hubbletransaction (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  order_id TEXT,
  amount NUMERIC,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_hubblewebhookevent (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idempotency_key TEXT UNIQUE,
  payload TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_merchantprofile (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE,
  business_name TEXT
);
