package com.fdmgroup.SmartPay_BackEnd.exception.wallet;


/**
 * Thrown when a wallet id doesn't exist
 * Maps to HTTP 400 Bad Request via GlobalExceptionHandler.
 */
public class WalletNotFoundException extends RuntimeException {
    public WalletNotFoundException(String message) {
        super(message);
    }
}
