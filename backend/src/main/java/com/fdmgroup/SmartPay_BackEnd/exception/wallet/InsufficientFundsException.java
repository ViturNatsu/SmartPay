package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
