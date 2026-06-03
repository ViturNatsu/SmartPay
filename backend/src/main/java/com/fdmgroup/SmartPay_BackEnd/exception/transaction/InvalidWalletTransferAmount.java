package com.fdmgroup.SmartPay_BackEnd.exception.transaction;

import lombok.Getter;

@Getter
public class InvalidWalletTransferAmount extends RuntimeException {
  private double receivedAmount;
  private static final String MESSAGE = "Invalid wallet transfer amount";

  public InvalidWalletTransferAmount() {super(MESSAGE);}

  public InvalidWalletTransferAmount(String message) {
    super(message);
  }

  public InvalidWalletTransferAmount(double receivedAmount) {
    super(MESSAGE);
    this.receivedAmount = receivedAmount;
  }

  public InvalidWalletTransferAmount(String message, double receivedAmount) {
    super(message);
    this.receivedAmount = receivedAmount;
  }
}
