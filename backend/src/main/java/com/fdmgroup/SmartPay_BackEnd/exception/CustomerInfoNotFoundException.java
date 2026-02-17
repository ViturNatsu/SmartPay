package com.fdmgroup.SmartPay_BackEnd.exception;

public class CustomerInfoNotFoundException extends RuntimeException {
    public CustomerInfoNotFoundException(String message) {
        super(message);
    }
}
