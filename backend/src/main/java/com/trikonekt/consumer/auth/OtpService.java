package com.trikonekt.consumer.auth;

import com.trikonekt.consumer.common.BusinessException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class OtpService {
  private final SecureRandom secureRandom = new SecureRandom();
  private final OtpRepository otpRepository;
  private final SmsService smsService;
  private final HashingService hashingService;

  @Value("${app.otp.expiry-minutes}")
  private int expiryMinutes;
  @Value("${app.otp.window-minutes}")
  private int windowMinutes;
  @Value("${app.otp.max-requests-per-window}")
  private int maxRequestsPerWindow;

  public OtpService(OtpRepository otpRepository, SmsService smsService, HashingService hashingService) {
    this.otpRepository = otpRepository;
    this.smsService = smsService;
    this.hashingService = hashingService;
  }

  public void sendOtp(String mobile, OtpPurpose purpose) {
    Instant windowStart = Instant.now().minus(windowMinutes, ChronoUnit.MINUTES);
    if (otpRepository.countRecent(mobile, purpose, windowStart) >= maxRequestsPerWindow) {
      throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP requests. Please try again later.");
    }

    String otp = String.valueOf(100000 + secureRandom.nextInt(900000));
    String providerResponse = smsService.sendOtp(mobile, otp, expiryMinutes);
    otpRepository.create(
        mobile,
        purpose,
        hashingService.otpHash(mobile, otp),
        Instant.now().plus(expiryMinutes, ChronoUnit.MINUTES),
        providerResponse
    );
  }

  public void verifyOtp(String mobile, OtpPurpose purpose, String otp) {
    OtpRecord record = otpRepository.findLatestUsable(mobile, purpose)
        .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "OTP expired or not found"));

    if (record.attempts() >= 5) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Too many invalid OTP attempts");
    }

    String submittedHash = hashingService.otpHash(mobile, otp);
    if (!submittedHash.equals(record.otpHash())) {
      otpRepository.incrementAttempts(record.id());
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Invalid OTP");
    }

    otpRepository.markConsumed(record.id());
  }
}

