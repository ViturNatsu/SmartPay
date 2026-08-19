package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

public class WalletDailyLimitRequestDTO {

    @DecimalMin(
        value = "1.00",
        inclusive = true,
        message = "Daily spending limit must be at least $1.00"
    )
    @DecimalMax(
        value = "10000.00",
        inclusive = true,
        message = "Daily spending limit cannot exceed $10,000.00"
    )
    @Digits(
        integer = 5,
        fraction = 2,
        message = "Daily spending limit cannot have more than 2 decimal places"
    )
    private BigDecimal dailySpendingLimit;

    public BigDecimal getDailySpendingLimit() {
        return dailySpendingLimit;
    }

    public void setDailySpendingLimit(BigDecimal dailySpendingLimit) {
        this.dailySpendingLimit = dailySpendingLimit;
    }
}