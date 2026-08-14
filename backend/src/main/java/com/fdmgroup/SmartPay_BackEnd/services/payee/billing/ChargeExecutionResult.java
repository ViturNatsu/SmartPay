package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChargeExecutionResult {

    private final String providerReferenceId;
    private final String walletTransactionId;
}
