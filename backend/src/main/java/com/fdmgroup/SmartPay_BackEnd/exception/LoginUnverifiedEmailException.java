package com.fdmgroup.SmartPay_BackEnd.exception;

public class LoginUnverifiedEmailException extends RuntimeException {
    public LoginUnverifiedEmailException() { super(); }
    public LoginUnverifiedEmailException(String message) { super(message); }
}
