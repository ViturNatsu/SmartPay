package com.fdmgroup.SmartPay_BackEnd.services.payment;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;

public interface SubscriptionPaymentService {
    ChargeExecutionResult paySubscription(RecurringChargeRequest request);
}
