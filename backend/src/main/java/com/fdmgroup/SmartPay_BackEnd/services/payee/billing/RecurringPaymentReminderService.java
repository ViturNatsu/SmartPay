package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;

/**
 * Generates "upcoming recurring payment" reminders (US-NOTIF-BE-06, Scenarios 10 &amp; 11) through the
 * shared notification service, honouring the configurable lead time and per-cycle deduplication.
 */
public interface RecurringPaymentReminderService {

    /**
     * Evaluates all active recurring payees and creates a reminder for any whose next scheduled date
     * falls within the configured lead-time window, subject to interval-based suppression and
     * one-reminder-per-cycle deduplication.
     */
    void sendUpcomingReminders(LocalDate referenceDate);
}
