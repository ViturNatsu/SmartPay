package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class LoginInvalidCredentialsException extends RuntimeException {
    public LoginInvalidCredentialsException() { super(); }
    public LoginInvalidCredentialsException(String message) { super(message); }
}
