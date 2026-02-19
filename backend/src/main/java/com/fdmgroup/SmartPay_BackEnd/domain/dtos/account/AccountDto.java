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
<<<<<<< HEAD
    private String accountNumber;
=======
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
    private Double balance;
    private AccountType accountType;
    private Long userId;
    
//  private Customer customer - links to customer info
}
