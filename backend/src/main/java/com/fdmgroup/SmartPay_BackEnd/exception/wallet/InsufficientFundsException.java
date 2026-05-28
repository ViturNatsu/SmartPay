package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

/**
 * Thrown when a withdrawal amount exceeds the user's current wallet balance.
 * Maps to HTTP 422 Unprocessable Content via GlobalExceptionHandler.
 */
public class InsufficientFundsException extends RuntimeException {

    public InsufficientFundsException(String message) {
        super(message);
    }
}
