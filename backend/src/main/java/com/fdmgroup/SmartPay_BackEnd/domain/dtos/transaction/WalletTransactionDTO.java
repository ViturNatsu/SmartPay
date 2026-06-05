package com.fdmgroup.SmartPay_BackEnd.domain.dtos.transaction;

import lombok.Getter;
import lombok.Setter;


/**
 * To be used for wallet to wallet transactions
 */
@Getter
@Setter
public class WalletTransactionDTO {
  private Long senderUserId;
  private Long receiverUserId;
  private Double amount;
  private String memo;
}
