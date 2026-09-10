package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPaymentProcessResultDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;

public interface RecurringBillingService {

    BillingChargeOutcome processDuePayment(RecurringPayee recurringPayee, LocalDate billingCycleDate);

    RecurringPaymentProcessResultDTO processDuePaymentsForDate(LocalDate processingDate);
}
