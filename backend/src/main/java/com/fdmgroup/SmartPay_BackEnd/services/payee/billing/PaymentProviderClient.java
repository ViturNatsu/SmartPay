package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

public interface PaymentProviderClient {

    ChargeExecutionResult executeCharge(RecurringChargeRequest request);

    boolean confirmChargeSucceeded(String providerReferenceId);
}
