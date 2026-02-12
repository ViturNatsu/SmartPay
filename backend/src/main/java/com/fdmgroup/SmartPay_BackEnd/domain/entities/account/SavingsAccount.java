package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "savings_accounts")
@Getter
@Setter
public class SavingsAccount extends Account {
    @Override
    public AccountType getType() {
        return AccountType.SAVINGS;
    }

    // Additional fields specific to savings accounts can be added here
}
