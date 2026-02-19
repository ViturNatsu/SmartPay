package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AccountDto {

    private Long id;
    private String accountName;
    private String accountNumber;
    private Double balance;
    private AccountType accountType;
    private Long userId;
    
//  private Customer customer - links to customer info
}
