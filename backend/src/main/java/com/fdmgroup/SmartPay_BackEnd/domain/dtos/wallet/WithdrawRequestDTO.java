package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

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

    /** Amount to withdraw; must be > 0 and ≤ current wallet balance. */
    private Double amount;
}
