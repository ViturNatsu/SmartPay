package com.fdmgroup.SmartPay_BackEnd.exception.cardrequest;

public class InvalidCardRequestStatusException extends RuntimeException {
    public InvalidCardRequestStatusException(String message) {

        super(message);
    }
}
