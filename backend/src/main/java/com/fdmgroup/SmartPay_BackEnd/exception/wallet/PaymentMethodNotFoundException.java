package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

public class PaymentMethodNotFoundException extends RuntimeException {
    public PaymentMethodNotFoundException(String message) {
        super(message);
    }
}
