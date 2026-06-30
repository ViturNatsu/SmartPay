package com.fdmgroup.SmartPay_BackEnd.exception.card;

public class CardStatusOperationNotAllowedException extends RuntimeException {

    public CardStatusOperationNotAllowedException(String message) {
        super(message);
    }
}
