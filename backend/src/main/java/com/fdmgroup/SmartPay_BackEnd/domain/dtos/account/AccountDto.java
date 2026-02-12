package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import lombok.*;

@Getter
@Setter
public class AccountDto {
    // To be used in the future

    private Long id;
    private Double balance;
    private String accountType;
    private String accountName;
    private long userId;
    
//  private Customer customer - links to customer info
}
