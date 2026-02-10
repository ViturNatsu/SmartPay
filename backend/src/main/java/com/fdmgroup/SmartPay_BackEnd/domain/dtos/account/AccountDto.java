package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import lombok.*;

@Getter
@Setter
public class AccountDto {

    //
    private Long id;
    private Double balance;
    private String accountType;
    private String accountName;
    private long userId;
    
    //legal name
    private String firstName;
    private String middleName;
    private String lastName;

    //contact information
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String province;
    private String postalCode;
    private String phoneNumber;

    //identification informatoin
    private String socialInsuranceNumber;
    private String governmentIdType;
    private String governmentIdNumber;
}
