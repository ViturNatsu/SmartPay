package com.fdmgroup.SmartPay_BackEnd.exception.cardRequest;

public class CardRequestNotFoundException extends RuntimeException {
    public CardRequestNotFoundException(String message) {
        super(message);
    }
}
