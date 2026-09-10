package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecurringPaymentProcessResultDTO {
    private LocalDate invocationDate;
    private long paymentsFoundAtTrigger;
    private long paymentsActive;
    private long successfullyProcessedCount;
    private long alreadyChargedCount;
    private long failedCount;
    private long recoveredAfterCrash;
}
