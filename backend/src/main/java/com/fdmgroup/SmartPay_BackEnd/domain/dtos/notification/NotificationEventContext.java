package com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Getter;

/**
 * Structured, event-specific data the shared notification service uses to build a notification's
 * detail message (US-NOTIF-BE-06). Callers supply facts (amount, payee, date, ...), never free-form
 * message text — the message and tier are resolved from the event definition.
 */
@Getter
@Builder
public class NotificationEventContext {

    /** Monetary amount involved in the event, when applicable. */
    private final Double amount;

    /** Display name of the payee/counterparty (e.g. "Netflix", "John Smith"). */
    private final String counterpartyName;

    /** Scheduled/relevant date (e.g. the recurring payment's scheduled charge date). */
    private final LocalDate scheduledDate;

    /** Human-readable frequency for recurring events (e.g. "Monthly"). */
    private final String frequency;

    /** Linked bank / card display name, when applicable. */
    private final String bankName;

    /** Last four digits of a card, for card-change messages (never the full number / CVV). */
    private final String cardLastFour;

    public static NotificationEventContext empty() {
        return NotificationEventContext.builder().build();
    }
}
