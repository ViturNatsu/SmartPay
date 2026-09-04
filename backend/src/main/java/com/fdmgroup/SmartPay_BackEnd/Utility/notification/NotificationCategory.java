package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

/**
 * Preference category for a notification event. Every {@link NotificationEventType} is assignable
 * to exactly one category so that delivery/preference resolution (US-NOTIF-BE-08) can be layered on
 * top without redefining which events exist. This story only assigns categories; it does not
 * consume them.
 */
public enum NotificationCategory {
    RECURRING_PAYMENT,
    TRANSFER,
    CARD,
    SECURITY,
    WALLET,
    GENERAL
}
