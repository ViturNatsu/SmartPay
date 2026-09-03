package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class InvalidPaymentMethodException extends RuntimeException {
    public InvalidPaymentMethodException(String message) { super(message); }
}
