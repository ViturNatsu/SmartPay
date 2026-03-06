package com.fdmgroup.SmartPay_BackEnd.exception.user;

public class LoginUnverifiedEmailException extends RuntimeException {
    public LoginUnverifiedEmailException() { super(); }
    public LoginUnverifiedEmailException(String message) { super(message); }

    public static class EmailAlreadyExistsException extends RuntimeException {
        public EmailAlreadyExistsException(String email) {
            super("Email already registered " + email);
        }
    }
}
