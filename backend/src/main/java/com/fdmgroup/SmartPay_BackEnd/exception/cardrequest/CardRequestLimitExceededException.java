package com.fdmgroup.SmartPay_BackEnd.exception.cardrequest;

public class CardRequestLimitExceededException extends RuntimeException {
    public CardRequestLimitExceededException(String message) {
        super(message);
    }
}
