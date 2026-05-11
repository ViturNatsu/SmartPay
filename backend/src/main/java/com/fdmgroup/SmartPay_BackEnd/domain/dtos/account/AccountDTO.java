package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountDTO {

    private Long id;
    private String accountName;
    private String accountNumber;
    private String accountNumberDigest;
    private String institutionNumber;
    private String transitNumber;
    private Double balance;
    private AccountType accountType;
    private Long userId;
    private Boolean active;
    
//  private Customer customer - links to customer info
}
