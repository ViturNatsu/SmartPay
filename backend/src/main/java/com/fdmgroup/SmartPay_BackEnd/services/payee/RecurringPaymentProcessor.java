package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.time.LocalDate;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPaymentProcessResultDTO;

public interface RecurringPaymentProcessor {
    RecurringPaymentProcessResultDTO processDuePayments();

    RecurringPaymentProcessResultDTO processDuePayments(LocalDate invocationDate);
}
