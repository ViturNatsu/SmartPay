package com.fdmgroup.SmartPay_BackEnd.exception.auth;
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
