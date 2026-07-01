package com.trikonekt.consumer.kyc;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class KycProfileService {

    private final KycProfileRepository repository;
    private final DigiLockerService digiLockerService;
    private final EncryptionService encryptionService;

    public KycProfileService(KycProfileRepository repository,
                             DigiLockerService digiLockerService,
                             EncryptionService encryptionService) {
        this.repository = repository;
        this.digiLockerService = digiLockerService;
        this.encryptionService = encryptionService;
    }

    @Transactional
    public String startKyc(long userId, String redirectUri) {
        KycProfile profile = repository.findByUserId(userId).orElseGet(() -> {
            KycProfile newProfile = new KycProfile();
            newProfile.setUserId(userId);
            newProfile.setStatus("NOT_STARTED");
            return newProfile;
        });

        String state = UUID.randomUUID().toString();
        profile.setState(state);
        profile.setStatus("IN_PROGRESS");
        repository.save(profile);

        return digiLockerService.generateAuthorizationUrl(state);
    }

    @Transactional
    public KycProfile handleCallback(String state, String code) {
        KycProfile profile = repository.findByState(state)
            .orElseThrow(() -> new RuntimeException("Invalid state token. Verification flow expired or hijacked."));

        // Exchange code for tokens
        Map<String, String> tokens = digiLockerService.exchangeCodeForTokens(code);
        String accessToken = tokens.get("access_token");
        String refreshToken = tokens.get("refresh_token");
        String digiLockerId = tokens.get("digilockerid");

        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("Authorization code exchange did not return access token");
        }

        // Encrypt tokens
        profile.setAccessTokenEncrypted(encryptionService.encrypt(accessToken));
        profile.setRefreshTokenEncrypted(encryptionService.encrypt(refreshToken));
        profile.setDigilockerId(digiLockerId);

        // Fetch user profile from DigiLocker
        Map<String, Object> dlProfile = digiLockerService.getUserProfile(accessToken);
        profile.setName((String) dlProfile.get("name"));
        profile.setDob((String) dlProfile.get("dob"));
        profile.setGender((String) dlProfile.get("gender"));
        profile.setEmail((String) dlProfile.get("email"));
        profile.setMobile((String) dlProfile.get("mobile"));
        profile.setAddress((String) dlProfile.get("address"));
        profile.setPhoto((String) dlProfile.get("photo"));
        profile.setAadhaarLast4((String) dlProfile.get("aadhaar_last4"));
        profile.setPanNumber((String) dlProfile.get("pan_number"));

        // Fetch issued documents list
        String documentsJson = digiLockerService.getIssuedDocuments(accessToken);
        profile.setIssuedDocumentsJson(documentsJson);

        // Update status to PENDING and clear state (prevents token reuse)
        profile.setStatus("PENDING");
        profile.setState(""); // clear state
        repository.save(profile);

        return profile;
    }

    @Transactional
    public KycProfile approveProfile(long profileId, long adminId, String remarks) {
        KycProfile profile = repository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("KYC Profile not found"));

        if (!"PENDING".equals(profile.getStatus())) {
            throw new RuntimeException("KYC Profile is not in PENDING state (Current status: " + profile.getStatus() + ")");
        }

        profile.setStatus("VERIFIED");
        profile.setRemarks(remarks != null ? remarks : "Approved by administrator");
        profile.setVerifiedAt(Instant.now());
        profile.setVerifiedById(adminId);
        repository.save(profile);

        // Sync flags to legacy Django tables to unlock gated features
        repository.syncToLegacyTables(profile.getUserId(), "VERIFIED", adminId);

        return profile;
    }

    @Transactional
    public KycProfile rejectProfile(long profileId, long adminId, String remarks) {
        KycProfile profile = repository.findById(profileId)
            .orElseThrow(() -> new RuntimeException("KYC Profile not found"));

        profile.setStatus("REJECTED");
        profile.setRemarks(remarks != null ? remarks : "Rejected by administrator");
        profile.setVerifiedAt(null);
        profile.setVerifiedById(adminId);
        repository.save(profile);

        // Sync rejection to legacy Django tables
        repository.syncToLegacyTables(profile.getUserId(), "REJECTED", adminId);

        return profile;
    }

    public String getDecryptedAccessToken(KycProfile profile) {
        return encryptionService.decrypt(profile.getAccessTokenEncrypted());
    }

    public String getDecryptedRefreshToken(KycProfile profile) {
        return encryptionService.decrypt(profile.getRefreshTokenEncrypted());
    }
}
