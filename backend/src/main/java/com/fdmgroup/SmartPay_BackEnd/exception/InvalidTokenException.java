package com.fdmgroup.SmartPay_BackEnd.exception;
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
