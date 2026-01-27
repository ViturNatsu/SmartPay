package com.fdmgroup.SmartPay_BackEnd.exception;

public class AccountLockedException extends RuntimeException {
    public AccountLockedException(String message) {
        super(message);
    }
}

