package com.fdmgroup.SmartPay_BackEnd.exception;

public class AccessCodeInvalidatedException extends RuntimeException {
    public AccessCodeInvalidatedException(String message) {
        super(message);
    }
}
