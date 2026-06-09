package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WithdrawResponseDTO {

    private String transactionId;
    private Double newBalance;
    private Double amount;
    private LocalDateTime createdAt;
}
