package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

/**
 * Thrown when a withdrawal amount is zero, negative, or otherwise invalid.
 * Maps to HTTP 400 Bad Request via GlobalExceptionHandler.
 */
public class InvalidWithdrawAmountException extends RuntimeException {

    public InvalidWithdrawAmountException(String message) {
        super(message);
    }
}
