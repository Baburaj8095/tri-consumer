package com.trikonekt.consumer.kyc;

import java.time.Instant;

public class KycProfile {
    private Long id;
    private Long userId;
    private String status;
    private String digilockerId;
    private String accessTokenEncrypted;
    private String refreshTokenEncrypted;
    private String name;
    private String dob;
    private String gender;
    private String email;
    private String mobile;
    private String address;
    private String photo;
    private String aadhaarLast4;
    private String panNumber;
    private String issuedDocumentsJson;
    private String state;
    private String remarks;
    private String codeVerifier;
    private Instant verifiedAt;
    private Long verifiedById;
    private Instant createdAt;
    private Instant updatedAt;

    public KycProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDigilockerId() { return digilockerId; }
    public void setDigilockerId(String digilockerId) { this.digilockerId = digilockerId; }

    public String getAccessTokenEncrypted() { return accessTokenEncrypted; }
    public void setAccessTokenEncrypted(String accessTokenEncrypted) { this.accessTokenEncrypted = accessTokenEncrypted; }

    public String getRefreshTokenEncrypted() { return refreshTokenEncrypted; }
    public void setRefreshTokenEncrypted(String refreshTokenEncrypted) { this.refreshTokenEncrypted = refreshTokenEncrypted; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    public String getAadhaarLast4() { return aadhaarLast4; }
    public void setAadhaarLast4(String aadhaarLast4) { this.aadhaarLast4 = aadhaarLast4; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getIssuedDocumentsJson() { return issuedDocumentsJson; }
    public void setIssuedDocumentsJson(String issuedDocumentsJson) { this.issuedDocumentsJson = issuedDocumentsJson; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public Long getVerifiedById() { return verifiedById; }
    public void setVerifiedById(Long verifiedById) { this.verifiedById = verifiedById; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getCodeVerifier() { return codeVerifier; }
    public void setCodeVerifier(String codeVerifier) { this.codeVerifier = codeVerifier; }
}
