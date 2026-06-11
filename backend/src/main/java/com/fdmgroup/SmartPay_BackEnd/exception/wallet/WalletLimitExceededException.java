package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

public class WalletLimitExceededException extends RuntimeException{
    
    public WalletLimitExceededException(String message) {
        super(message);
    }
}
