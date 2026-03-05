package com.fdmgroup.SmartPay_BackEnd.exception.auth;

public class AccessCodeInvalidatedException extends RuntimeException {
    public AccessCodeInvalidatedException(String message) {
        super(message);
    }
}
