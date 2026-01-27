package com.fdmgroup.SmartPay_BackEnd.exception;

public class AccessCodeExpiredException extends RuntimeException {

    public AccessCodeExpiredException(String message) {
        super(message);
    }
}
