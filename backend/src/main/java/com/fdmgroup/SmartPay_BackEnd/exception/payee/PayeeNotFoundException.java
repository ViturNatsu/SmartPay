package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class PayeeNotFoundException extends RuntimeException {

    public PayeeNotFoundException(String message) {
        super(message);
    }

}
