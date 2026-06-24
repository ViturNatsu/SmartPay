package com.fdmgroup.SmartPay_BackEnd.exception.cardRequest;

public class CardRequestLimitExceededException extends RuntimeException {
    public CardRequestLimitExceededException(String message) {
        super(message);
    }
}
