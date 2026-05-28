# Tri Consumer API

Spring Boot + JDBC backend for OTP, registration, login, and user session management.

## Run

Local development uses an embedded H2 file database by default, created under `backend/data/`.

To use MySQL instead, create a MySQL database:

```sql
CREATE DATABASE trikonekt_consumer;
```

Set environment variables:

```txt
DB_URL=jdbc:mysql://localhost:3306/trikonekt_consumer?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=password
AQUASMS_USERNAME=Joel
AQUASMS_APIKEY=your-rotated-key
AQUASMS_SENDERNAME=TRIKNT
AQUASMS_SMSTYPE=TRANS
OTP_PEPPER=change-this-secret
FRONTEND_ORIGIN=http://localhost:3000
```

Start:

```bash
mvn spring-boot:run
```

## Endpoints

```txt
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/login
GET  /api/users/me
```
