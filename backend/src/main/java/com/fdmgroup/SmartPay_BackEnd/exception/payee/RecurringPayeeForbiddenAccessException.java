package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class RecurringPayeeForbiddenAccessException extends RuntimeException{
    
    public RecurringPayeeForbiddenAccessException(String message){
        super(message);
    }
}
