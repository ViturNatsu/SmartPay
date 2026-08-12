package com.fdmgroup.SmartPay_BackEnd.exception.payee;

public class RecurringPayeeAlreadyPaused extends RuntimeException {
  public RecurringPayeeAlreadyPaused(String message) {
    super(message);
  }
}
