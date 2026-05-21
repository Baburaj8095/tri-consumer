# Secure SMS/OTP Module Implementation Plan

## Goal Description
Create a reusable, secure service in the consumer app to generate OTPs, send them via AquaSMS HTTP API, validate DLT template, handle retries, log activity, and process delivery reports.

## User Review Required
> [!IMPORTANT]
> Confirm the backend runtime environment (Node.js/Express, Next.js API routes, or serverless) and preferred queue library (BullMQ, RabbitMQ, or simple in‑memory queue).

## Open Questions
> [!WARNING]
> - Which directory should the new service files be placed in (`src/services/` or `src/api/`)?
> - Do you already have a central config/env management utility to store `AQUASMS_USERNAME` and `AQUASMS_APIKEY`?
> - Should the DLR webhook be protected by a secret token or IP whitelist?

---

## Proposed Changes

### Service Layer
#### [NEW] `src/services/smsService.js`
- Exported class `SMSService` with methods:
  - `sendOtp(mobile, otp, minutes)` – builds message, URL‑encodes, calls AquaSMS GET, logs request/response, stores `msgid`.
  - `retryRequest(url, attempts = 3)` – exponential backoff for temporary failures.
  - `validateResponseCode(code)` – maps AquaSMS error codes to friendly messages.

#### [NEW] `src/services/otpGenerator.js`
- Function `generateOtp(length = 6)` returns random numeric string.
- Function `generateExpiry(minutes = 5)` returns expiry timestamp.

### DLT Template Validator
#### [NEW] `src/services/dltValidator.js`
- Constant `DLT_TEMPLATE = "Dear Customer, your OTP for signup registration is {OTP}. Valid for {MINUTES} minutes. Please do not share it with anyone. - TOOZO (TRIKNOKET)"`.
- `validateMessage(message)` ensures exact match after placeholder replacement and that URL‑encoded version does not add extra spaces.

### URL Encoder Utility
#### [NEW] `src/utils/urlEncode.js`
- `encodeMessage(str)` uses `encodeURIComponent` and replaces spaces with `+` for AquaSMS compatibility.

### Retry Handler
#### [NEW] `src/utils/retry.js`
- Generic `retryAsync(fn, retries, delay)` with exponential backoff.

### Delivery Report Processor
#### [NEW] `src/api/aquasmsDlr.js`
- Express (or Next.js API) POST `/callbacks/aquasms-dlr` endpoint.
- Parses body `{msgid, mobile, status, err_code, done_time}` and stores to `deliveryLogs` collection (or simple JSON file).
- Returns `200 OK`.

### Error Logger
#### [NEW] `src/utils/logger.js`
- Simple wrapper around `console` or `winston` to log request/response, errors, and retry attempts.

### Queue System (Bulk SMS)
#### [NEW] `src/queues/smsQueue.js`
- Uses BullMQ (if available) to schedule jobs, respecting TPS limit (e.g., max 10 jobs/second).
- Worker processes jobs by invoking `SMSService.sendOtp`.

### Environment & Security
- Add `.env` variables: `AQUASMS_USERNAME`, `AQUASMS_APIKEY`, `AQUASMS_SENDERNAME=TRINKT`, `AQUASMS_SMSTYPE=TRANS`.
- Ensure these are loaded via `dotenv` at app start.
- Optional IP whitelist check in DLR endpoint.

### Integration with Existing UI
- In `LoginForm.jsx` add a call to `SMSService.sendOtp` when user requests OTP.
- Store returned `msgid` in component state for later verification if needed.
- Display loading spinner and handle error messages based on `validateResponseCode`.

---

## Verification Plan
### Automated Tests
- Unit tests for `otpGenerator`, `dltValidator`, `urlEncode`, and `retry` utilities.
- Mock HTTP GET to AquaSMS and assert correct URL formation and handling of each error code.
- Integration test for DLR webhook using supertest.

### Manual Verification
- Trigger OTP from UI, check that SMS is sent (mocked) and that `msgid` is logged.
- Simulate DLR POST payload and verify storage.
- Ensure retry logic works by forcing temporary network failure.

**Please review the plan and provide any needed clarifications or approval to proceed.**
