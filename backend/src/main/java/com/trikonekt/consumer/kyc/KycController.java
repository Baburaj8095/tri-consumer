package com.trikonekt.consumer.kyc;

import com.trikonekt.consumer.common.ApiResponse;
import com.trikonekt.consumer.user.UserService;
import com.trikonekt.consumer.user.dto.UserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/kyc")
public class KycController {

    private final KycProfileService kycProfileService;
    private final KycProfileRepository repository;
    private final UserService userService;

    @Value("${app.kyc.consumer-frontend-url:http://localhost:3000/user/kyc}")
    private String consumerFrontendUrl;

    @Value("${app.kyc.business-frontend-url:http://localhost:3000/business/kyc}")
    private String businessFrontendUrl;

    public KycController(KycProfileService kycProfileService,
                         KycProfileRepository repository,
                         UserService userService) {
        this.kycProfileService = kycProfileService;
        this.repository = repository;
        this.userService = userService;
    }

    @GetMapping("/status")
    public ApiResponse<Map<String, Object>> getKycStatus(@RequestHeader("Authorization") String authHeader) {
        UserResponse user = userService.currentUser(authHeader);
        Optional<KycProfile> profileOpt = repository.findByUserId(user.getId());

        Map<String, Object> data = new HashMap<>();
        if (profileOpt.isPresent()) {
            KycProfile p = profileOpt.get();
            data.put("status", p.getStatus());
            data.put("name", p.getName());
            data.put("aadhaar_last4", p.getAadhaarLast4());
            data.put("pan_number", p.getPanNumber());
            data.put("remarks", p.getRemarks());
            data.put("verified_at", p.getVerifiedAt());
            data.put("created_at", p.getCreatedAt());
            data.put("updated_at", p.getUpdatedAt());
        } else {
            data.put("status", "NOT_STARTED");
        }
        return ApiResponse.ok("KYC status fetched successfully", data);
    }

    @PostMapping("/start")
    public ApiResponse<Map<String, String>> startKyc(@RequestHeader("Authorization") String authHeader,
                                                      @RequestParam(defaultValue = "web") String platform) {
        UserResponse user = userService.currentUser(authHeader);
        String authUrl = kycProfileService.startKyc(user.getId(), platform);

        Map<String, String> data = new HashMap<>();
        data.put("authorization_url", authUrl);
        return ApiResponse.ok("Verification link generated successfully", data);
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleCallback(@RequestParam("state") String state,
                                               @RequestParam(value = "code", required = false) String code,
                                               @RequestParam(value = "error", required = false) String error,
                                               @RequestParam(value = "error_description", required = false) String errorDesc) {
        String baseRedirectUrl = state.startsWith("rn_") ? "trikonekt://kyc" : consumerFrontendUrl;
        
        try {
            // Determine user type to redirect correctly
            Optional<KycProfile> profileOpt = repository.findByState(state);
            if (profileOpt.isPresent()) {
                long userId = profileOpt.get().getUserId();
                // We don't have the Bearer token in callback, so we query the role from database
                boolean isBusiness = checkIsBusinessUser(userId);
                baseRedirectUrl = isBusiness ? businessFrontendUrl : (state.startsWith("rn_") ? "trikonekt://kyc" : consumerFrontendUrl);
            }

            if (error != null && !error.isEmpty()) {
                String encodedError = java.net.URLEncoder.encode(error, java.nio.charset.StandardCharsets.UTF_8);
                return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseRedirectUrl + "?kyc_callback=error&error=" + encodedError))
                    .build();
            }

            if (code == null || code.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(baseRedirectUrl + "?kyc_callback=error&error=missing_code"))
                    .build();
            }

            kycProfileService.handleCallback(state, code);
            
            return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(baseRedirectUrl + "?kyc_callback=success"))
                .build();
        } catch (Exception e) {
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown callback error";
            String encodedError = java.net.URLEncoder.encode(errorMsg, java.nio.charset.StandardCharsets.UTF_8);
            return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(baseRedirectUrl + "?kyc_callback=error&error=" + encodedError))
                .build();
        }
    }

    @GetMapping("/profile")
    public ApiResponse<KycProfile> getKycProfile(@RequestHeader("Authorization") String authHeader) {
        UserResponse user = userService.currentUser(authHeader);
        KycProfile profile = repository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("KYC Profile not found for this user"));

        // Clear encrypted credentials from response payload for security
        profile.setAccessTokenEncrypted("");
        profile.setRefreshTokenEncrypted("");
        
        return ApiResponse.ok("KYC profile details retrieved successfully", profile);
    }

    private boolean checkIsBusinessUser(long userId) {
        try {
            String category = repository.getUserCategory(userId);
            String role = repository.getUserRole(userId);
            return "business".equalsIgnoreCase(category) 
                || "merchant".equalsIgnoreCase(category)
                || "merchant".equalsIgnoreCase(role)
                || "agency".equalsIgnoreCase(role)
                || (category != null && category.startsWith("agency_"));
        } catch (Exception e) {
            return false;
        }
    }
}
