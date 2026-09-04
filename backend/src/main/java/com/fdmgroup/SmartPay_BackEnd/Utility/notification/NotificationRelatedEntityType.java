package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

public enum NotificationRelatedEntityType {
    WALLET("WALLET"),
    WALLET_TRANSACTION("WALLET_TRANSACTION"),
    AUDIT_LOG("AUDIT_LOG"),
    CARD("CARD"),
    RECURRING_PAYEE("RECURRING_PAYEE"),
    RECURRING_BILLING_CHARGE("RECURRING_BILLING_CHARGE");

    private final String value;

    NotificationRelatedEntityType(String name) {
        this.value = name;
    }

    public String getName() {
        return value;
    }
}
