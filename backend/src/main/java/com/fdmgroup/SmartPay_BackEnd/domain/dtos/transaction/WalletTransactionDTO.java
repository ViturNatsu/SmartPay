package com.fdmgroup.SmartPay_BackEnd.domain.dtos.transaction;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletTransactionDTO {
  private Long senderUserId;
  private Long receiverUserId;
  private Double amount;
  private String memo;
}
