package com.trikonekt.consumer.hubble.dto;

public record HubbleTransactionDto(
    String transactionReferenceId,
    String status,
    String amount,
    String discountAmount,
    String currency,
    String updatedAt,
    String createdAt
) {}
