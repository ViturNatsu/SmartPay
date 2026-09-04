package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

public enum RecurringBillingFailureReason {

    INSUFFICIENT_FUNDS,
    PER_TRANSACTION_LIMIT_EXCEEDED,
    DAILY_LIMIT_EXCEEDED,
    CARD_LOCKED,
    CARD_PENDING_REQUEST,
    NONE
}
