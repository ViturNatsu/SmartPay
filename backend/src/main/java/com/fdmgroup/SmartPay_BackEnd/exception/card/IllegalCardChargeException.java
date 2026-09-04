package com.fdmgroup.SmartPay_BackEnd.exception.card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingFailureReason;

public class IllegalCardChargeException extends RuntimeException {

    public RecurringBillingFailureReason failureReason = RecurringBillingFailureReason.NONE;

    public IllegalCardChargeException(String message, RecurringBillingFailureReason failureReason) {
        super(message);
        this.failureReason = failureReason;
    }
}
