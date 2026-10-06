package com.trikonekt.consumer.auth;

import java.net.URI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class SmsService {
  private static final Logger log = LoggerFactory.getLogger(SmsService.class);
  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${aquasms.base-url}")
  private String baseUrl;
  @Value("${aquasms.username}")
  private String username;
  @Value("${aquasms.apikey}")
  private String apiKey;
  @Value("${aquasms.sendername}")
  private String senderName;
  @Value("${aquasms.smstype}")
  private String smsType;

  public String sendOtp(String mobile, String otp, int minutes) {
    if (apiKey == null || apiKey.isBlank()) {
      throw new IllegalStateException("AQUASMS_APIKEY is not configured. Please ensure AQUASMS_APIKEY is set in your .env file.");
    }

    String cleanMobile = mobile == null ? "" : mobile.replaceAll("[^0-9]", "");
    if (cleanMobile.isBlank() || cleanMobile.length() < 10) {
      throw new IllegalArgumentException("Invalid mobile number format for SMS dispatch: " + mobile);
    }

    String message = "Dear Customer, your OTP for signup registration is %s. Valid for %d minutes. Please do not share it with anyone. - TOOZO (TRIKNOKET)"
        .formatted(otp, minutes);

    URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl)
        .queryParam("username", username)
        .queryParam("apikey", apiKey)
        .queryParam("sendername", senderName)
        .queryParam("smstype", smsType)
        .queryParam("numbers", cleanMobile)
        .queryParam("message", message)
        .build()
        .encode()
        .toUri();

    log.info("AquaSMS dispatch request to {}: {}", cleanMobile, maskApiKey(uri.toString()));
    ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
    String body = response.getBody() == null ? "" : response.getBody();
    log.info("AquaSMS response status={}, body={}", response.getStatusCodeValue(), body);
    if (!response.getStatusCode().is2xxSuccessful() || !looksSuccessful(body)) {
      throw new IllegalStateException("AquaSMS gateway rejected OTP delivery: " + body);
    }
    return body;
  }

  private boolean looksSuccessful(String body) {
    if (body == null || body.isBlank()) {
      return false;
    }
    String normalized = body.toLowerCase();
    if (normalized.contains("err:") || normalized.contains("\"status\":\"error\"") || normalized.contains("invalid") || normalized.contains("failure")) {
      return false;
    }
    return normalized.contains("success") || normalized.contains("sent") || normalized.contains("msgid");
  }

  private String maskApiKey(String url) {
    if (apiKey == null || apiKey.isBlank()) {
      return url;
    }
    return url.replace(apiKey, "****");
  }
}
