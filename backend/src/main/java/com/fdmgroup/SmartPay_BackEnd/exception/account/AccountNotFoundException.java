package com.fdmgroup.SmartPay_BackEnd.exception.account;

public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(String message) {
        super(message);
    }    
}
