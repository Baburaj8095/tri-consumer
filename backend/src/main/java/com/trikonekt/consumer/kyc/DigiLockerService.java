package com.trikonekt.consumer.kyc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class DigiLockerService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.digilocker.client-id:mock}")
    private String clientId;

    @Value("${app.digilocker.client-secret:mock_secret}")
    private String clientSecret;

    @Value("${app.digilocker.redirect-uri:http://localhost:8080/api/kyc/callback}")
    private String redirectUri;

    @Value("${app.digilocker.authorize-url:https://digilocker.gov.in/public/oauth2/1/authorize}")
    private String authorizeUrl;

    @Value("${app.digilocker.token-url:https://digilocker.gov.in/public/oauth2/1/token}")
    private String tokenUrl;

    @Value("${app.digilocker.profile-url:https://api.digilocker.gov.in/public/oauth2/1/user}")
    private String profileUrl;

    @Value("${app.digilocker.documents-url:https://api.digilocker.gov.in/public/oauth2/1/files/issued}")
    private String documentsUrl;

    public DigiLockerService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public boolean isMockMode() {
        return "mock".equalsIgnoreCase(clientId) || clientId.isBlank();
    }

    public String generateAuthorizationUrl(String state, String codeChallenge) {
        if (isMockMode()) {
            // Redirect internally to the mock handler route
            return "/api/kyc/callback?code=mock_code_12345&state=" + state;
        }
        return authorizeUrl + "?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&state=" + state
                + "&code_challenge=" + codeChallenge
                + "&code_challenge_method=S256";
    }

    public Map<String, String> exchangeCodeForTokens(String code, String codeVerifier) {
        if (isMockMode() || code.startsWith("mock_")) {
            Map<String, String> tokens = new HashMap<>();
            tokens.put("access_token", "mock_access_token_" + System.currentTimeMillis());
            tokens.put("refresh_token", "mock_refresh_token_" + System.currentTimeMillis());
            tokens.put("digilockerid", "DL_12345678");
            return tokens;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("code", code);
            map.add("grant_type", "authorization_code");
            map.add("client_id", clientId);
            map.add("client_secret", clientSecret);
            map.add("redirect_uri", redirectUri);
            if (codeVerifier != null && !codeVerifier.isBlank()) {
                map.add("code_verifier", codeVerifier);
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(tokenUrl, request, JsonNode.class);

            JsonNode body = response.getBody();
            Map<String, String> tokens = new HashMap<>();
            if (body != null) {
                tokens.put("access_token", body.path("access_token").asText(""));
                tokens.put("refresh_token", body.path("refresh_token").asText(""));
                tokens.put("digilockerid", body.path("digilockerid").asText(""));
            }
            return tokens;
        } catch (Exception e) {
            throw new RuntimeException("Failed to exchange authorization code with DigiLocker: " + e.getMessage(), e);
        }
    }

    public Map<String, String> refreshAccessToken(String refreshToken) {
        if (isMockMode() || refreshToken.startsWith("mock_")) {
            Map<String, String> tokens = new HashMap<>();
            tokens.put("access_token", "mock_access_token_refreshed_" + System.currentTimeMillis());
            tokens.put("refresh_token", refreshToken);
            return tokens;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("refresh_token", refreshToken);
            map.add("grant_type", "refresh_token");
            map.add("client_id", clientId);
            map.add("client_secret", clientSecret);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(tokenUrl, request, JsonNode.class);

            JsonNode body = response.getBody();
            Map<String, String> tokens = new HashMap<>();
            if (body != null) {
                tokens.put("access_token", body.path("access_token").asText(""));
                tokens.put("refresh_token", body.path("refresh_token").asText(""));
            }
            return tokens;
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh DigiLocker access token: " + e.getMessage(), e);
        }
    }

    public Map<String, Object> getUserProfile(String accessToken) {
        if (isMockMode() || accessToken.startsWith("mock_")) {
            Map<String, Object> profile = new HashMap<>();
            profile.put("digilockerid", "DL_12345678");
            profile.put("name", "Baburaj Balaji");
            profile.put("dob", "1995-05-15");
            profile.put("gender", "M");
            profile.put("email", "baburaj@example.com");
            profile.put("mobile", "9876543210");
            profile.put("address", "123, Growth Street, Pincode Area, Chennai, Tamil Nadu - 600001");
            profile.put("photo", "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="); // 1px transparent gif
            profile.put("aadhaar_last4", "8095");
            profile.put("pan_number", "ABCDE1234F");
            return profile;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<JsonNode> response = restTemplate.exchange(profileUrl, HttpMethod.GET, entity, JsonNode.class);

            JsonNode body = response.getBody();
            Map<String, Object> profile = new HashMap<>();
            if (body != null) {
                profile.put("digilockerid", body.path("digilockerid").asText(""));
                profile.put("name", body.path("name").asText(""));
                profile.put("dob", body.path("dob").asText(""));
                profile.put("gender", body.path("gender").asText(""));
                profile.put("email", body.path("email").asText(""));
                profile.put("mobile", body.path("mobile").asText(""));
                profile.put("address", body.path("address").asText(""));
                profile.put("photo", body.path("photo").asText(""));
                // Fallbacks from nested nodes if present
                if (body.has("eaadhaar")) {
                    JsonNode eaadhaar = body.get("eaadhaar");
                    profile.put("aadhaar_last4", eaadhaar.path("last4").asText(""));
                }
            }
            return profile;
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve profile from DigiLocker: " + e.getMessage(), e);
        }
    }

    public String getIssuedDocuments(String accessToken) {
        if (isMockMode() || accessToken.startsWith("mock_")) {
            return "{\"items\":["
                    + "{\"name\":\"Aadhaar Card\",\"uri\":\"in.gov.uidai-aadhaar\",\"type\":\"Aadhaar\"},"
                    + "{\"name\":\"PAN Verification Record\",\"uri\":\"in.gov.tax-pan\",\"type\":\"PAN\"}"
                    + "]}";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(documentsUrl, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "{\"items\":[]}";
        }
    }
}
