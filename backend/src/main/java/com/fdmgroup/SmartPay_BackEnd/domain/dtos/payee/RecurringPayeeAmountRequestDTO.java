package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public class RecurringPayeeAmountRequestDTO {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least $1.00")
    @DecimalMax(value = "10000.00", message = "Amount cannot exceed $10,000.00")
    @Digits(integer = 5, fraction = 2, message = "Amount can have a maximum of 2 decimal places")
    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}