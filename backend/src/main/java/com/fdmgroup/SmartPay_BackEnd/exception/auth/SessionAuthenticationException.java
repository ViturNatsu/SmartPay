package com.fdmgroup.SmartPay_BackEnd.exception.auth;

import javax.naming.AuthenticationException;

public class SessionAuthenticationException extends AuthenticationException {
    public SessionAuthenticationException(String message) {
        super(message);
    }
}

