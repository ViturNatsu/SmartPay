package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class RecurringPayeeNotPaused extends RuntimeException {
    public RecurringPayeeNotPaused(String message) {
        super(message);
    }
}
