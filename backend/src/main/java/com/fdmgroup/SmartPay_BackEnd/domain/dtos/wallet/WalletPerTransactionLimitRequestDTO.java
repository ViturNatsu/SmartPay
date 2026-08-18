package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

public class WalletPerTransactionLimitRequestDTO {

    @DecimalMin(
        value = "1.00",
        inclusive = true,
        message = "Per-transaction limit must be at least $1.00"
    )
    @DecimalMax(
        value = "10000.00",
        inclusive = true,
        message = "Per-transaction limit cannot exceed $10,000.00"
    )
    @Digits(
        integer = 5,
        fraction = 2,
        message = "Per-transaction limit cannot have more than 2 decimal places"
    )
    private BigDecimal perTransactionLimit;

    public BigDecimal getPerTransactionLimit() {
        return perTransactionLimit;
    }

    public void setPerTransactionLimit(BigDecimal perTransactionLimit) {
        this.perTransactionLimit = perTransactionLimit;
    }
}