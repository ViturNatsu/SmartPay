package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

/**
 * Thrown when a wallet transaction id doesn't exist
 * Maps to HTTP 404 Not Found via GlobalExceptionHandler.
 */
public class WalletTransactionNotFoundException extends RuntimeException{
    
        public WalletTransactionNotFoundException(String message) {
        super(message);
    }
}
