package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringPaymentScheduler {

    private final RecurringBillingService recurringBillingService;

    /** Process due recurring payments daily at 2 AM. */
    @Scheduled(cron = "0 0 2 * * *")
    // @Scheduled(fixedRate = 10000) // 10seconds for dev/qa only to test
    public void processDueRecurringPayments() {
        log.info("Starting recurring payment billing run");
        recurringBillingService.processDuePaymentsForDate(LocalDate.now());
        log.info("Finished recurring payment billing run");
    }
}
