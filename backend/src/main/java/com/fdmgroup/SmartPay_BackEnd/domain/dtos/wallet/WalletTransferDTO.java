package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record WalletTransferDTO(
        @NotNull Long recipientUserId,

        @NotNull
        @DecimalMin(
                value = "1.00",
                inclusive = true,
                message = "Amount must be at least $1.00"
        )
        @DecimalMax(
                value = "10000.00",
                inclusive = true,
                message = "Amount cannot exceed $10,000.00"
        )
        @Digits(
                integer = 5,
                fraction = 2,
                message = "Amount cannot have more than 2 decimal places"
        )
        BigDecimal amount,

        @Size(max = 100, message = "Memo cannot exceed 100 characters")
        @Pattern(
                regexp = "^[A-Za-z0-9 ]*$",
                message = "Memo can only contain letters, numbers, and spaces"
        )
        String memo
) {}