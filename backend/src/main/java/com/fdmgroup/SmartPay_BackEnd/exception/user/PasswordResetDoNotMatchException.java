package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class PasswordResetDoNotMatchException extends RuntimeException {
    public PasswordResetDoNotMatchException(String message) {
        super(message);
    }
}

