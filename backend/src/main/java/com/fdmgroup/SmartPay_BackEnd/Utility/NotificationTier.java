package com.fdmgroup.SmartPay_BackEnd.Utility;

public enum NotificationTier {
    T1(1),
    T2(2),
    T3(3),
    T4(4);

    private final int value;

    NotificationTier(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
