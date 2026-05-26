package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

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
    @JsonIgnoreProperties({"accounts"})
    private List<User> users;
    private Boolean active;
    
//  private Customer customer - links to customer info
}
