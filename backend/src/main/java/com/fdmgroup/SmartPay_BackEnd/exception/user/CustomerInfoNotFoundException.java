package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class CustomerInfoNotFoundException extends RuntimeException {
    public CustomerInfoNotFoundException(String message) {
        super(message);
    }
}
