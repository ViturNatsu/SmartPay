package com.fdmgroup.SmartPay_BackEnd.exception;

public class AccessCodeMismatchException extends RuntimeException {

    public AccessCodeMismatchException(String message) {
        super(message);
    }
}
