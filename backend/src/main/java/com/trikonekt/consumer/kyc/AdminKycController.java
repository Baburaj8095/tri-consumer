package com.trikonekt.consumer.kyc;

import com.trikonekt.consumer.admin.AdminService;
import com.trikonekt.consumer.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/kyc")
public class AdminKycController {

    private final KycProfileService kycProfileService;
    private final KycProfileRepository repository;
    private final AdminService adminService;

    public AdminKycController(KycProfileService kycProfileService,
                              KycProfileRepository repository,
                              AdminService adminService) {
        this.kycProfileService = kycProfileService;
        this.repository = repository;
        this.adminService = adminService;
    }

    // Expose GET /api/admin/kyc/ to match the React fetcher exactly
    @GetMapping("")
    public ResponseEntity<Map<String, Object>> listProfiles(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "user", required = false) String user,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "page_size", defaultValue = "20") int pageSize) {
        
        adminService.requireAdmin(authHeader);

        // Normalize page parameter (1-based from DataTable, map to 0-based for offset)
        int pageIndex = page > 0 ? page - 1 : 0;
        int offset = pageIndex * pageSize;

        // Use 'user' parameter as search fallback if search is empty
        String searchVal = (search != null && !search.isEmpty()) ? search : user;

        // Map frontend status filter to database status filter
        String statusFilter = "";
        if ("pending".equalsIgnoreCase(status) || "submitted".equalsIgnoreCase(status)) {
            statusFilter = "PENDING";
        } else if ("verified".equalsIgnoreCase(status)) {
            statusFilter = "VERIFIED";
        } else if ("rejected".equalsIgnoreCase(status)) {
            statusFilter = "REJECTED";
        }

        List<Map<String, Object>> results = repository.findAllForAdmin(searchVal, statusFilter, pageSize, offset);
        int count = repository.countForAdmin(searchVal, statusFilter);

        Map<String, Object> response = new HashMap<>();
        response.put("results", results);
        response.put("count", count);

        return ResponseEntity.ok(response);
    }

    // Expose PATCH /api/admin/kyc/{userId}/verify/ to match React handleVerify
    @PatchMapping("/{userId}/verify/")
    public ResponseEntity<Map<String, Object>> verifyUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("userId") long userId) {
        
        String adminUsername = adminService.requireAdmin(authHeader);
        Long adminId = getAdminUserId(adminUsername);

        // Fetch kyc_profile ID by user ID
        KycProfile profile = repository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC Profile not found for user: " + userId));

        // Mark verified
        kycProfileService.approveProfile(profile.getId(), adminId, "Approved by admin: " + adminUsername);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "User KYC verified successfully");
        return ResponseEntity.ok(res);
    }

    // Expose PATCH /api/admin/kyc/{userId}/reject/ to match React handleReject
    @PatchMapping("/{userId}/reject/")
    public ResponseEntity<Map<String, Object>> rejectUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("userId") long userId) {
        
        String adminUsername = adminService.requireAdmin(authHeader);
        Long adminId = getAdminUserId(adminUsername);

        // Fetch kyc_profile ID by user ID
        KycProfile profile = repository.findByUserId(userId)
            .orElseThrow(() -> new RuntimeException("KYC Profile not found for user: " + userId));

        // Mark rejected
        kycProfileService.rejectProfile(profile.getId(), adminId, "Rejected by admin: " + adminUsername);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "User KYC rejected successfully");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(@RequestHeader("Authorization") String authHeader) {
        adminService.requireAdmin(authHeader);
        return ApiResponse.ok("KYC statistics fetched successfully", repository.getStatistics());
    }

    private Long getAdminUserId(String adminUsername) {
        Long adminId = repository.getUserIdByUsername(adminUsername);
        return adminId != null ? adminId : 1L;
    }
}
