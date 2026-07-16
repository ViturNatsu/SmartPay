package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class InvalidRecurringPayeeException extends RuntimeException{

    public InvalidRecurringPayeeException(String message){
        super(message);
    }
}
