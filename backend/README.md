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

## Deploy to AWS EC2

This backend can be deployed to Amazon EC2 using a standard Spring Boot jar.

### Prerequisites

- AWS CLI installed and configured
- An EC2 key pair in the target AWS region
- A security group permitting inbound TCP 22 and 8080
- Java 17 runtime on the EC2 instance (the helper script installs Corretto on Amazon Linux)

### Quick deploy steps

1. Build the backend jar:

   ```powershell
   cd backend
   mvn clean package -DskipTests
   ```

2. Run the deployment helper:

   ```powershell
   cd backend
   .\deploy-ec2.ps1 -KeyName "your-ec2-keypair" -Region "us-east-1"
   ```

3. After the script completes, open:

   ```text
   http://<EC2_PUBLIC_DNS>:8080
   ```

### Notes

- The helper script is configured for Amazon Linux 2023 in `us-east-1` by default.
- If you use a different region or AMI, update `AmiId`, `Region`, and `SshUsername` accordingly.
- For production, use a managed database instead of the default H2 file database.
```
