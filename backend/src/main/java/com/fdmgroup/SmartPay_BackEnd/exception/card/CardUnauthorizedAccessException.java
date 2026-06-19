package com.fdmgroup.SmartPay_BackEnd.exception.card;

public class CardUnauthorizedAccessException extends RuntimeException {

    public CardUnauthorizedAccessException() {
        super("Card Unauthorized Access");
    }

    public CardUnauthorizedAccessException(String message) {
        super(message);
    }
}
