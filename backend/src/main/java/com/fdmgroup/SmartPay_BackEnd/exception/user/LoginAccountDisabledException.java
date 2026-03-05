package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class LoginAccountDisabledException extends RuntimeException {
    public LoginAccountDisabledException() { super(); }
    public LoginAccountDisabledException(String message) { super(message); }
}
