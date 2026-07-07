package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.time.Instant;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WalletTransactionDTO {

    private String transactionId;
    private WalletTransactionType type;
    private RailType railType;
    private Double amount;
    private String bankDisplayName;
    private String description;
    private String status;
    private Instant createdAt;
    private boolean isFavourite;
}
