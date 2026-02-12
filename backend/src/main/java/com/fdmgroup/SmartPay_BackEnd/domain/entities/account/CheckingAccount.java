package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chequing_accounts")
@Getter
@Setter
public class CheckingAccount extends Account {
    @Override
    public AccountType getType() {
        return AccountType.CHECKING;
    }

    // Additional fields specific to checking accounts can be added here
}
