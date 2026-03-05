package com.fdmgroup.SmartPay_BackEnd.exception.auth;

public class EmailAlreadyVerifiedException extends RuntimeException {
    public EmailAlreadyVerifiedException(String message) {
        super(message);
    }
}
