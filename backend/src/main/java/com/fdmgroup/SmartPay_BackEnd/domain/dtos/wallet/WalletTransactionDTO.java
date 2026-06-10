package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.time.LocalDateTime;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletTransactionDTO {

    private String transactionId;
    private WalletTransactionType type;
    private Double amount;
    private String bankDisplayName;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
