package com.fdmgroup.SmartPay_BackEnd.exception.transaction;

public class InvalidWalletTransferMemo extends RuntimeException {
  private static final String MESSAGE = "Message fails to match required pattern";


  public InvalidWalletTransferMemo() {super(MESSAGE);}
  public InvalidWalletTransferMemo(String message) {
    super(message);
  }
}
