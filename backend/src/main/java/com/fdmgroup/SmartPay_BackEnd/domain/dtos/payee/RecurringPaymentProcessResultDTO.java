package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RecurringPaymentProcessResultDTO {
    private final LocalDate invocationDate;
    private final int processedCount;
}
