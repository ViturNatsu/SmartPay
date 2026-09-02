package com.fdmgroup.SmartPay_BackEnd.exception.card;

public class IllegalCardChargeException extends RuntimeException {

    // replace with the proper enum reasoning
    // TO DO: UPDATE TO ENUM
    public int reason = 0;

    public IllegalCardChargeException(String message, int k) {
        super(message);
    }
}
