package com.fdmgroup.SmartPay_BackEnd.exception.wallet;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

public class WalletNotFound extends RuntimeException {
  private static String MESSAGE = "Wallet not found";
  public WalletNotFound(){
    super(MESSAGE);
  }
  public WalletNotFound(String message) {
    super(message);
  }
}
