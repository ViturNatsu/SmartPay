package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

public enum NotificationRelatedEntityType {
    WALLET("WALLET"),
    WALLET_TRANSACTION("WALLET_TRANSACTION"),
    AUDIT_LOG("AUDIT_LOG");

    private final String value;

    NotificationRelatedEntityType(String name) {
        this.value = name;
    }

    public String getName() {
        return value;
    }
}
