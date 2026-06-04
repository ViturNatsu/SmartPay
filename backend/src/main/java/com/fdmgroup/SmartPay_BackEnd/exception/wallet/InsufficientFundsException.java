package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

/**
 * Thrown when a wallet or bank account has insufficient funds for the requested operation.
 * Maps to HTTP 422 Unprocessable Content via GlobalExceptionHandler.
 */
public class InsufficientFundsException extends RuntimeException {

    public InsufficientFundsException(String message) {
        super(message);
    }
}
