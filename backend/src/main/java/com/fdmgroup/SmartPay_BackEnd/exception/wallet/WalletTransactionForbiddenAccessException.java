package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

/**
 * Thrown when a wallet transaction id doesn't exist
 * Maps to HTTP 403 Forbidden via GlobalExceptionHandler.
 */
public class WalletTransactionForbiddenAccessException extends RuntimeException{

     public WalletTransactionForbiddenAccessException(String message) {
        super(message);
    }
    
}
