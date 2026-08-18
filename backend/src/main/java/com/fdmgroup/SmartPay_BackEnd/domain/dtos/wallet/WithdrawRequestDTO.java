package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for a wallet withdrawal request.
 * Carries only the fields the endpoint needs (ISP) — the target
 * payment method and the amount to deduct from the wallet balance.
 */
@Getter
@Setter
public class WithdrawRequestDTO {

    /** ID of the destination linked bank account (payment method). */
    private Long paymentMethodId;

    @NotNull
    @DecimalMin(
        value = "1.00",
        inclusive = true,
        message = "Amount must be at least $1.00"
    )
    @Digits(
        integer = 5,
        fraction = 2,
        message = "Amount cannot have more than 2 decimal places"
)
    /** Amount to withdraw; must be > 0 and ≤ current wallet balance. */
    private BigDecimal amount;
}
