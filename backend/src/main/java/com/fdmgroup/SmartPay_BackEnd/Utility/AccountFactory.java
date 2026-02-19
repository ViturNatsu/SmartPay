package com.fdmgroup.SmartPay_BackEnd.Utility;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.SavingsAccount;
<<<<<<< HEAD
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
@Component
public class AccountFactory {
    private final AccountRepository accountRepository;

    @Autowired
    public AccountFactory(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

=======
import org.springframework.stereotype.Component;
@Component
public class AccountFactory {
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
    public Account createAccount(AccountType type){
        if (type == null) {
            throw new IllegalArgumentException("Account type cannot be null");
        }

<<<<<<< HEAD
        Account account;

        account = switch (type){
            case SAVINGS -> new SavingsAccount();
            case CHECKING -> new CheckingAccount();
        };

        // Get the raw number from the DB sequence
        Long seq = accountRepository.getNextAccountNumberSequence();
        // Format to 8 digits
        String formattedNumber = String.format("%08d", seq);
        account.setAccountNumber(formattedNumber);

        return account;
    }
    
=======
        return switch (type){
            case SAVINGS -> new SavingsAccount();
            case CHECKING -> new CheckingAccount();
        };
    }

    private AccountFactory(){}
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
}
