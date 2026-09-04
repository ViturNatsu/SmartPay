package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingFailureReason;

/**
 * The single, central catalogue of notification-generating events (US-NOTIF-BE-06).
 *
 * <p>Each event owns its own definition — the coarse {@link NotificationType} category the existing
 * UI renders from, the {@link NotificationTier} (T1–T4 per the story's Tier Assignments table),
 * the preference {@link NotificationCategory} (consumed later by US-NOTIF-BE-08), the fixed title,
 * and the {@link NotificationRelatedEntityType} the notification links to. The human-readable detail
 * message is built from event context by {@code NotificationMessageResolver}.
 *
 * <p>Callers pass an event type + context to the shared creation service; they never assemble a
 * notification (type/tier/message) themselves.
 */
public enum NotificationEventType {

    // ----- Recurring payment failures (T1) -------------------------------------------------
    RECURRING_PAYMENT_FAILED_INSUFFICIENT_FUNDS(
            NotificationType.WARNING, NotificationTier.T1, NotificationCategory.RECURRING_PAYMENT,
            "Recurring payment failed", NotificationRelatedEntityType.RECURRING_BILLING_CHARGE),
    RECURRING_PAYMENT_FAILED_PER_TRANSACTION_LIMIT(
            NotificationType.WARNING, NotificationTier.T1, NotificationCategory.RECURRING_PAYMENT,
            "Recurring payment failed", NotificationRelatedEntityType.RECURRING_BILLING_CHARGE),
    RECURRING_PAYMENT_FAILED_DAILY_LIMIT(
            NotificationType.WARNING, NotificationTier.T1, NotificationCategory.RECURRING_PAYMENT,
            "Recurring payment failed", NotificationRelatedEntityType.RECURRING_BILLING_CHARGE),
    RECURRING_PAYMENT_FAILED_CARD_LOCKED(
            NotificationType.WARNING, NotificationTier.T1, NotificationCategory.RECURRING_PAYMENT,
            "Recurring payment failed", NotificationRelatedEntityType.RECURRING_BILLING_CHARGE),
    RECURRING_PAYMENT_FAILED_CARD_PENDING_REPLACEMENT(
            NotificationType.WARNING, NotificationTier.T1, NotificationCategory.RECURRING_PAYMENT,
            "Recurring payment failed", NotificationRelatedEntityType.RECURRING_BILLING_CHARGE),

    // ----- Failed transfers / loads (T2) ---------------------------------------------------
    P2P_TRANSFER_FAILED(
            NotificationType.WARNING, NotificationTier.T2, NotificationCategory.TRANSFER,
            "Transfer failed", NotificationRelatedEntityType.WALLET_TRANSACTION),
    WALLET_TRANSFER_FAILED(
            NotificationType.WARNING, NotificationTier.T2, NotificationCategory.TRANSFER,
            "Transfer failed", NotificationRelatedEntityType.WALLET_TRANSACTION),
    WALLET_LOAD_FAILED(
            NotificationType.WARNING, NotificationTier.T2, NotificationCategory.WALLET,
            "Wallet load failed", NotificationRelatedEntityType.WALLET_TRANSACTION),

    // ----- Card details changed (T2) -------------------------------------------------------
    CARD_DETAILS_CHANGED(
            NotificationType.INFO, NotificationTier.T2, NotificationCategory.CARD,
            "Your card details have changed", NotificationRelatedEntityType.CARD),

    // ----- Successful outbound money movement (T3, confirmatory) ---------------------------
    OUTBOUND_P2P_SEND_SUCCESS(
            NotificationType.SUCCESS, NotificationTier.T3, NotificationCategory.TRANSFER,
            "Payment successful", NotificationRelatedEntityType.WALLET_TRANSACTION),
    WALLET_WITHDRAWAL_SUCCESS(
            NotificationType.SUCCESS, NotificationTier.T3, NotificationCategory.WALLET,
            "Withdrawal successful", NotificationRelatedEntityType.WALLET_TRANSACTION),

    // ----- Successful inbound money movement (T4, informational) ---------------------------
    INBOUND_P2P_RECEIVED(
            NotificationType.SUCCESS, NotificationTier.T4, NotificationCategory.TRANSFER,
            "Money received", NotificationRelatedEntityType.WALLET_TRANSACTION),
    WALLET_LOAD_SUCCESS(
            NotificationType.SUCCESS, NotificationTier.T4, NotificationCategory.WALLET,
            "Wallet loaded", NotificationRelatedEntityType.WALLET_TRANSACTION),

    // ----- Upcoming recurring payment reminder (T4) ----------------------------------------
    RECURRING_PAYMENT_REMINDER(
            NotificationType.INFO, NotificationTier.T4, NotificationCategory.RECURRING_PAYMENT,
            "Upcoming recurring payment", NotificationRelatedEntityType.RECURRING_PAYEE);

    private final NotificationType type;
    private final NotificationTier tier;
    private final NotificationCategory category;
    private final String title;
    private final NotificationRelatedEntityType relatedEntityType;

    NotificationEventType(NotificationType type, NotificationTier tier, NotificationCategory category,
                          String title, NotificationRelatedEntityType relatedEntityType) {
        this.type = type;
        this.tier = tier;
        this.category = category;
        this.title = title;
        this.relatedEntityType = relatedEntityType;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationTier getTier() {
        return tier;
    }

    public NotificationCategory getCategory() {
        return category;
    }

    public String getTitle() {
        return title;
    }

    public NotificationRelatedEntityType getRelatedEntityType() {
        return relatedEntityType;
    }

    /**
     * Resolves the recurring-payment failure event for a persisted {@link RecurringBillingFailureReason}
     * (US-NOTIF-BE-07). All four spec reasons plus the "card pending replacement" variant are covered.
     */
    public static NotificationEventType fromRecurringFailureReason(RecurringBillingFailureReason reason) {
        if (reason == null) {
            return null;
        }
        return switch (reason) {
            case INSUFFICIENT_FUNDS -> RECURRING_PAYMENT_FAILED_INSUFFICIENT_FUNDS;
            case PER_TRANSACTION_LIMIT_EXCEEDED -> RECURRING_PAYMENT_FAILED_PER_TRANSACTION_LIMIT;
            case DAILY_LIMIT_EXCEEDED -> RECURRING_PAYMENT_FAILED_DAILY_LIMIT;
            case CARD_LOCKED -> RECURRING_PAYMENT_FAILED_CARD_LOCKED;
            case CARD_PENDING_REQUEST -> RECURRING_PAYMENT_FAILED_CARD_PENDING_REPLACEMENT;
            case NONE -> null;
        };
    }
}
