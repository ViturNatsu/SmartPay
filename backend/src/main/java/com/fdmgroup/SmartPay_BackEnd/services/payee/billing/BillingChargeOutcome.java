package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

public enum BillingChargeOutcome {
    CHARGED,
    ALREADY_COMPLETED,
    RECOVERED_AFTER_CRASH,
    FAILED
}
