package com.fdmgroup.SmartPay_BackEnd.services;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Email already registered " + email);
    }
}
