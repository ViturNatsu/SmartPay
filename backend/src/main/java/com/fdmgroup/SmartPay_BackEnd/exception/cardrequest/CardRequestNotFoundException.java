package com.fdmgroup.SmartPay_BackEnd.exception.cardrequest;

public class CardRequestNotFoundException extends RuntimeException {
    public CardRequestNotFoundException(String message) {
        super(message);
    }
}
