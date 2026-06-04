package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import jakarta.validation.constraints.*;

public record WalletTransferDTO(
        @NotNull Long recipientUserId,

        @NotNull
        @DecimalMin(value = "0.01", message = "Amount must be at least $0.01")
        @DecimalMax(value = "3000.00", message = "Amount cannot exceed $3,000.00")
        Double amount,

        @Size(max = 100, message = "Memo cannot exceed 100 characters")
        @Pattern(regexp = "^[A-Za-z0-9 ]*$", message = "Memo can only contain letters, numbers, and spaces")
        String memo
) {}
