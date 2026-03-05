package com.fdmgroup.SmartPay_BackEnd.exception.auth;

public class AccessCodeExpiredException extends RuntimeException {

    public AccessCodeExpiredException(String message) {
        super(message);
    }
}
