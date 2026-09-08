package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Fires the daily sweep for upcoming recurring payment reminders (US-NOTIF-BE-06, Scenario 10).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringPaymentReminderScheduler {

    private final RecurringPaymentReminderService reminderService;

    /** Evaluate upcoming reminders daily at 6 AM. */
    @Scheduled(cron = "0 0 6 * * *")
    public void sendUpcomingReminders() {
        log.info("Starting recurring payment reminder run");
        reminderService.sendUpcomingReminders(LocalDate.now());
        log.info("Finished recurring payment reminder run");
    }
}
