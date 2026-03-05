package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
