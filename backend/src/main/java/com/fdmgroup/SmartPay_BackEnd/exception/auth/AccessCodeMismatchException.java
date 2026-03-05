package com.fdmgroup.SmartPay_BackEnd.exception.auth;

public class AccessCodeMismatchException extends RuntimeException {

    public AccessCodeMismatchException(String message) {
        super(message);
    }
}
