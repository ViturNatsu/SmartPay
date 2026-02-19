package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import jakarta.persistence.*;

// JPA Schema Trigger to manage business-key sequence
@Entity
public class AccountNumberSequence {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "acc_num_gen")
    @SequenceGenerator(
            name = "acc_num_gen",
            sequenceName = "ACCOUNT_NUMBER_SEQ",
            initialValue = 10000000,
            allocationSize = 1
    )
    private Long id;
}
