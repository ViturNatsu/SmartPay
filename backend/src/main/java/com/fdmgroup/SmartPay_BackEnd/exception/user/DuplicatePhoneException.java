package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class DuplicatePhoneException extends RuntimeException{
    public DuplicatePhoneException(String message){
        super(message);
    }

}
