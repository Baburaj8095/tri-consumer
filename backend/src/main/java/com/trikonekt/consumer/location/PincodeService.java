package com.trikonekt.consumer.location;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trikonekt.consumer.common.BusinessException;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class PincodeService {
  private static final Logger log = LoggerFactory.getLogger(PincodeService.class);
  private static final String PINCODES_INFO_URL = "https://pincodesinfo.in/api/pincode/{pinCode}";
  private static final String POSTAL_PINCODE_URL = "https://api.postalpincode.in/pincode/{pinCode}";

  private final ObjectMapper objectMapper;
  private final RestTemplate restTemplate;

  public PincodeService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
    SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
    requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
    requestFactory.setReadTimeout((int) Duration.ofSeconds(8).toMillis());
    this.restTemplate = new RestTemplate(requestFactory);
  }

  public LocationResponse findByPincode(String pinCode) {
    String normalizedPin = pinCode == null ? "" : pinCode.trim();
    if (!normalizedPin.matches("\\d{6}")) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "Enter a valid 6-digit pincode");
    }

    try {
      String body = restTemplate.getForObject(PINCODES_INFO_URL, String.class, normalizedPin);
      LocationResponse response = parsePincodesInfoLocation(normalizedPin, body);
      if (response != null) {
        return response;
      }
    } catch (BusinessException ex) {
      throw ex;
    } catch (RestClientException ex) {
      log.warn("PincodesInfo lookup failed for {}: {}", normalizedPin, ex.getMessage());
    } catch (Exception ex) {
      log.warn("PincodesInfo response could not be parsed for {}: {}", normalizedPin, ex.getMessage());
    }

    try {
      String body = restTemplate.getForObject(POSTAL_PINCODE_URL, String.class, normalizedPin);
      LocationResponse response = parsePostalPincodeLocation(normalizedPin, body);
      if (response != null) {
        return response;
      }
    } catch (BusinessException ex) {
      throw ex;
    } catch (RestClientException ex) {
      log.warn("Postal pincode lookup failed for {}: {}", normalizedPin, ex.getMessage());
    } catch (Exception ex) {
      log.warn("Postal pincode response could not be parsed for {}: {}", normalizedPin, ex.getMessage());
    }

    throw new BusinessException(HttpStatus.BAD_GATEWAY, "Postal pincode service unavailable. Please try again.");
  }

  private LocationResponse parsePincodesInfoLocation(String pinCode, String body) throws Exception {
    if (body == null || body.isBlank()) {
      return null;
    }

    JsonNode root = objectMapper.readTree(body);
    if (!root.path("success").asBoolean(false)) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Pincode not found");
    }

    JsonNode results = root.path("results");
    if (!results.isArray() || results.isEmpty()) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Pincode not found");
    }

    JsonNode postOffice = results.get(0);
    String taluk = text(postOffice, "taluk");
    String division = text(postOffice, "division");

    return new LocationResponse(
        pinCode,
        formatPlace(text(postOffice, "office_name")),
        isUsable(taluk) ? formatPlace(taluk) : formatPlace(division),
        formatPlace(text(postOffice, "district")),
        formatPlace(text(postOffice, "state")),
        "India"
    );
  }

  private LocationResponse parsePostalPincodeLocation(String pinCode, String body) throws Exception {
    if (body == null || body.isBlank()) {
      return null;
    }

    JsonNode root = objectMapper.readTree(body);
    if (!root.isArray() || root.isEmpty()) {
      return null;
    }

    JsonNode result = root.get(0);
    if (!"Success".equalsIgnoreCase(result.path("Status").asText())) {
      throw new BusinessException(HttpStatus.NOT_FOUND, "Pincode not found");
    }

    JsonNode postOffices = result.path("PostOffice");
    if (!postOffices.isArray() || postOffices.isEmpty()) {
      return null;
    }

    JsonNode postOffice = postOffices.get(0);
    String block = text(postOffice, "Block");
    String division = text(postOffice, "Division");
    String taluk = isUsable(block) ? block : division;

    return new LocationResponse(
        pinCode,
        text(postOffice, "Name"),
        taluk,
        text(postOffice, "District"),
        text(postOffice, "State"),
        text(postOffice, "Country")
    );
  }

  private String text(JsonNode node, String field) {
    return node.path(field).asText("");
  }

  private boolean isUsable(String value) {
    return value != null && !value.isBlank() && !"NA".equalsIgnoreCase(value);
  }

  private String formatPlace(String value) {
    if (!isUsable(value)) {
      return "";
    }
    String normalized = value
        .replaceAll("(?i)\\s+(s\\.?o\\.?|b\\.?o\\.?|h\\.?o\\.?)$", "")
        .replaceAll("(?i)\\s+division$", "")
        .trim()
        .toLowerCase();
    StringBuilder formatted = new StringBuilder();
    for (String part : normalized.split("\\s+")) {
      if (part.isBlank()) {
        continue;
      }
      if (formatted.length() > 0) {
        formatted.append(' ');
      }
      formatted.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
    }
    return formatted.toString();
  }
}
