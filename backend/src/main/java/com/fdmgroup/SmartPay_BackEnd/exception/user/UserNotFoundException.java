package com.fdmgroup.SmartPay_BackEnd.exception.user;

@SuppressWarnings("serial")
public class UserNotFoundException extends RuntimeException {
	public UserNotFoundException(String message) {
		super(message);
	}
}
