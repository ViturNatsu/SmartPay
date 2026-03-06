package com.fdmgroup.SmartPay_BackEnd.exception.auth;

public class AccessCodeUsedException extends RuntimeException {

    public AccessCodeUsedException(String message) {
        super(message);
    }
}
