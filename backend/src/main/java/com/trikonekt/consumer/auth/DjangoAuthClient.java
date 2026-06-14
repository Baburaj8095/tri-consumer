package com.trikonekt.consumer.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trikonekt.consumer.auth.dto.AuthResponse;
import com.trikonekt.consumer.auth.dto.LoginRequest;
import com.trikonekt.consumer.auth.dto.RegisterRequest;
import com.trikonekt.consumer.common.BusinessException;
import com.trikonekt.consumer.user.dto.UserResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Component
public class DjangoAuthClient {
  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final String baseUrl;
  private final String externalAuthSecret;

  public DjangoAuthClient(
      RestTemplateBuilder builder,
      ObjectMapper objectMapper,
      @Value("${app.django-api-base-url}") String baseUrl,
      @Value("${app.external-auth-shared-secret:}") String externalAuthSecret) {
    this.restTemplate = builder.build();
    this.objectMapper = objectMapper;
    this.baseUrl = stripTrailingSlash(baseUrl);
    this.externalAuthSecret = externalAuthSecret == null ? "" : externalAuthSecret.trim();
  }

  public AuthResponse register(RegisterRequest request) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("sponsor_id", clean(request.sponsorId()));
    payload.put("full_name", clean(request.fullName()));
    payload.put("phone", nationalMobile(request.mobile()));
    payload.put("email", clean(request.email()));
    payload.put("password", request.password());
    payload.put("pincode", clean(request.pinCode()));
    payload.put("category", "consumer");
    payload.put("role", "user");
    payload.put("country_name", "India");
    payload.put("state_name", clean(request.state()));
    payload.put("city_name", clean(request.district()));
    payload.put("area", "");

    JsonNode registered = postJson("/accounts/register/", payload);
    String username = text(registered, "username");
    if (username == null || username.isBlank()) {
      username = nationalMobile(request.mobile());
    }
    AuthResponse login = login(username, request.password(), "user");
    UserResponse user = userFromDjango(registered, login.getUser());
    return new AuthResponse(login.getAccess(), login.getRefresh(), user);
  }

  public AuthResponse login(LoginRequest request) {
    return login(request.username(), request.password(), "user");
  }

  public AuthResponse otpLogin(String mobile) {
    if (externalAuthSecret.isBlank()) {
      throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "External auth shared secret is not configured.");
    }
    Map<String, Object> payload = new HashMap<>();
    payload.put("phone", nationalMobile(mobile));
    payload.put("role", "user");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("X-External-Auth-Secret", externalAuthSecret);
    try {
      ResponseEntity<JsonNode> response = restTemplate.postForEntity(
          baseUrl + "/accounts/external/otp-token/",
          new HttpEntity<>(payload, headers),
          JsonNode.class);
      JsonNode data = response.getBody();
      String access = text(data, "access");
      String refresh = text(data, "refresh");
      if (access == null || access.isBlank()) {
        throw new BusinessException(HttpStatus.BAD_GATEWAY, "Django OTP login did not return an access token");
      }
      return new AuthResponse(access, refresh, userFromDjango(data == null ? null : data.get("user"), null));
    } catch (HttpStatusCodeException ex) {
      throw djangoException(ex);
    }
  }

  public UserResponse me(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      throw new BusinessException(HttpStatus.UNAUTHORIZED, "Missing bearer token");
    }

    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", authorizationHeader);
    try {
      ResponseEntity<JsonNode> response = restTemplate.exchange(
          baseUrl + "/accounts/me/",
          HttpMethod.GET,
          new HttpEntity<>(headers),
          JsonNode.class);
      return userFromDjango(response.getBody(), null, walletBalance(authorizationHeader));
    } catch (HttpStatusCodeException ex) {
      throw djangoException(ex);
    }
  }

  public AuthResponse refreshToken(String refreshToken) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("refresh", clean(refreshToken));
    JsonNode data = postJson("/accounts/token/refresh/", payload);
    String access = text(data, "access");
    String nextRefresh = text(data, "refresh");
    if (access == null || access.isBlank()) {
      throw new BusinessException(HttpStatus.BAD_GATEWAY, "Django token refresh did not return an access token");
    }
    return new AuthResponse(access, nextRefresh != null && !nextRefresh.isBlank() ? nextRefresh : refreshToken, null);
  }

  public String validateSponsor(String sponsorId) {
    if (sponsorId == null || sponsorId.isBlank()) {
      return null;
    }
    try {
      ResponseEntity<JsonNode> response = restTemplate.getForEntity(
          baseUrl + "/accounts/regions/by-sponsor/?sponsor=" + clean(sponsorId) + "&level=state",
          JsonNode.class);
      JsonNode body = response.getBody();
      if (body != null && body.has("sponsor")) {
        JsonNode sponsorNode = body.get("sponsor");
        String fullName = text(sponsorNode, "full_name");
        String username = text(sponsorNode, "username");
        return fullName != null ? fullName : username;
      }
    } catch (HttpStatusCodeException ex) {
      if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
        throw new BusinessException(HttpStatus.NOT_FOUND, "Sponsor ID not recognized");
      }
      throw djangoException(ex);
    }
    return null;
  }


  private AuthResponse login(String username, String password, String role) {
    Map<String, Object> payload = new HashMap<>();
    payload.put("username", clean(username));
    payload.put("password", password);
    payload.put("role", role);
    JsonNode data = postJson("/accounts/login/", payload);
    String access = text(data, "access");
    String refresh = text(data, "refresh");
    if (access == null || access.isBlank()) {
      throw new BusinessException(HttpStatus.BAD_GATEWAY, "Django login did not return an access token");
    }
    return new AuthResponse(access, refresh, null);
  }

  private JsonNode postJson(String path, Map<String, Object> payload) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    try {
      ResponseEntity<JsonNode> response = restTemplate.postForEntity(
          baseUrl + path,
          new HttpEntity<>(payload, headers),
          JsonNode.class);
      return response.getBody();
    } catch (HttpStatusCodeException ex) {
      throw djangoException(ex);
    }
  }

  private BusinessException djangoException(HttpStatusCodeException ex) {
    String message = "Django auth request failed";
    try {
      JsonNode body = objectMapper.readTree(ex.getResponseBodyAsString());
      if (body.hasNonNull("detail")) {
        message = body.get("detail").asText();
      } else if (body.hasNonNull("message")) {
        message = body.get("message").asText();
      } else if (body.size() > 0) {
        message = body.toString();
      }
    } catch (Exception ignored) {
      if (ex.getResponseBodyAsString() != null && !ex.getResponseBodyAsString().isBlank()) {
        message = ex.getResponseBodyAsString();
      }
    }
    return new BusinessException(ex.getStatusCode(), message);
  }

  private String walletBalance(String authorizationHeader) {
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", authorizationHeader);
    try {
      ResponseEntity<JsonNode> response = restTemplate.exchange(
          baseUrl + "/accounts/wallet/me/",
          HttpMethod.GET,
          new HttpEntity<>(headers),
          JsonNode.class);
      return firstText(response.getBody(), "balance", "main_balance", "withdrawable_balance");
    } catch (Exception ignored) {
      return null;
    }
  }

  private UserResponse userFromDjango(JsonNode node, UserResponse fallback) {
    return userFromDjango(node, fallback, null);
  }

  private UserResponse userFromDjango(JsonNode node, UserResponse fallback, String walletBalance) {
    if (node == null || node.isNull()) {
      return fallback;
    }
    long id = node.path("id").asLong(0L);
    String phone = text(node, "phone");
    String pincode = text(node, "pincode");
    return new UserResponse(
        id,
        text(node, "sponsor_id"),
        text(node, "registered_by_username"),
        valueOr(text(node, "full_name"), text(node, "username")),
        "+91",
        phone,
        text(node, "email"),
        pincode,
        valueOr(text(node, "city"), text(node, "city_name")),
        valueOr(text(node, "state"), text(node, "state_name")),
        bool(node, "is_active") ? "ACTIVE" : "INACTIVE",
        true,
        walletBalance,
        valueOr(text(node, "prefixed_id"), valueOr(text(node, "unique_id"), text(node, "username"))));
  }

  private static String stripTrailingSlash(String value) {
    String v = value == null || value.isBlank() ? "https://api.growth.vin/api" : value.trim();
    while (v.endsWith("/")) {
      v = v.substring(0, v.length() - 1);
    }
    return v;
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private static String nationalMobile(String mobile) {
    String digits = clean(mobile).replaceAll("[^0-9]", "");
    if (digits.length() > 10 && digits.startsWith("91")) {
      return digits.substring(digits.length() - 10);
    }
    return digits;
  }

  private static String text(JsonNode node, String field) {
    if (node == null || !node.hasNonNull(field)) {
      return null;
    }
    String value = node.get(field).asText();
    return value == null || value.isBlank() ? null : value;
  }

  private static String valueOr(String first, String second) {
    return first == null || first.isBlank() ? second : first;
  }

  private static String firstText(JsonNode node, String... fields) {
    if (node == null) {
      return null;
    }
    for (String field : fields) {
      String value = text(node, field);
      if (value != null && !value.isBlank()) {
        return value;
      }
    }
    return null;
  }

  private static boolean bool(JsonNode node, String field) {
    return node != null && (!node.has(field) || node.path(field).asBoolean(true));
  }
}
