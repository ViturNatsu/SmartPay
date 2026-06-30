package com.fdmgroup.SmartPay_BackEnd.exception.cardRequest;

public class InvalidCardRequestStatusException extends RuntimeException {
    public InvalidCardRequestStatusException(String message) {

        super(message);
    }
}
