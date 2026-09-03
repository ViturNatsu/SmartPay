package com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;

public interface ChargePipeline {

    ChargeExecutionResult execute(RecurringChargeRequest requestContext);
}
