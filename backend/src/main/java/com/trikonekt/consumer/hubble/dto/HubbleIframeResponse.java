package com.trikonekt.consumer.hubble.dto;

public record HubbleIframeResponse(
    String iframeUrl,
    int expiresIn
) {}
