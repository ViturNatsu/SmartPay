package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawResponseDTO {

    private String transactionId;
    private Double newBalance;
    private Double amount;
    private Instant createdAt;
}
