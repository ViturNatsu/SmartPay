package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

public record PayeeDTO(
        Long payeeId,
        Long recipientUserId,
        String recipientFirstName,
        String recipientLastName,
        String recipientEmail
) {}
