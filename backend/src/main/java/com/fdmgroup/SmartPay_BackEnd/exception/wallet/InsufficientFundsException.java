package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException() {
        super("Insufficient wallet balance to complete this transfer.");
    }
}
