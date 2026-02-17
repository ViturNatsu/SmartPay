package com.fdmgroup.SmartPay_BackEnd.Utility;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.SavingsAccount;
import org.springframework.stereotype.Component;
@Component
public class AccountFactory {
    public Account createAccount(AccountType type){
        if (type == null) {
            throw new IllegalArgumentException("Account type cannot be null");
        }

        return switch (type){
            case SAVINGS -> new SavingsAccount();
            case CHECKING -> new CheckingAccount();
        };
    }

    private AccountFactory(){}
}
