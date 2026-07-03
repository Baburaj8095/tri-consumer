package com.trikonekt.consumer.hubble;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Holds all Hubble SDK configuration read from environment variables.
 *
 * Django equivalents (settings.py):
 *   HUBBLE_CLIENT_ID          → app.hubble.client-id
 *   HUBBLE_JWT_PRIVATE_KEY_PEM → app.hubble.jwt-private-key-pem
 *   HUBBLE_SDK_BASE_URL       → app.hubble.sdk-base-url
 *   HUBBLE_WEBHOOK_SECRET     → app.hubble.webhook-secret
 *   HUBBLE_WEBHOOK_IP_ALLOWLIST → app.hubble.webhook-ip-allowlist
 */
@Component
public class HubbleConfig {

  @Value("${app.hubble.client-id:}")
  private String clientId;

  @Value("${app.hubble.jwt-private-key-pem:}")
  private String jwtPrivateKeyPem;

  @Value("${HUBBLE_CLIENT_SECRET:}")
  private String clientSecret;

  @Value("${app.hubble.sdk-base-url:https://sdk.myhubble.money/experience-center}")
  private String sdkBaseUrl;

  @Value("${app.hubble.webhook-secret:}")
  private String webhookSecret;

  @Value("${app.hubble.webhook-ip-allowlist:}")
  private String webhookIpAllowlist;

  @Value("${app.hubble.sdk-theme:}")
  private String sdkTheme;

  public String getClientId()            { return clientId == null ? "" : clientId.trim(); }
  public String getJwtPrivateKeyPem()    { return jwtPrivateKeyPem == null ? "" : jwtPrivateKeyPem.trim(); }
  public String getClientSecret()        { return clientSecret == null ? "" : clientSecret.trim(); }
  public String getSdkBaseUrl()          { return sdkBaseUrl == null ? "" : sdkBaseUrl.trim(); }
  public String getWebhookSecret()       { return webhookSecret == null ? "" : webhookSecret.trim(); }
  public String getWebhookIpAllowlist()  { return webhookIpAllowlist == null ? "" : webhookIpAllowlist.trim(); }
  public String getSdkTheme()            { return sdkTheme == null ? "" : sdkTheme.trim(); }

  /** True only if minimum required fields are set. */
  public boolean isConfigured() {
    return !getClientId().isBlank() && !getClientSecret().isBlank() && !getJwtPrivateKeyPem().isBlank() && !getSdkBaseUrl().isBlank();
  }
}
