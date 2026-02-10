package com.fdmgroup.SmartPay_BackEnd.services.impl.account;

import java.util.List;

import javax.security.auth.login.AccountNotFoundException;

import org.springframework.beans.BeanUtils;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import com.fdmgroup.SmartPay_BackEnd.services.account.UserNotFoundException;

import jakarta.transaction.Transactional;

public class AccountServiceImpl implements AccountService{
    private AccountRepository accountRepository;
    
     public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public Account addAccount(AccountDto accountDTO) throws UserNotFoundException {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'addAccount'");
    }

    @Override
    public List<Account> getAllAccounts(Long userId) {
       return accountRepository.findByUserId(userId);
    }

    @Override
    public List<Account> getAllSavingsAccounts(Long userId) {
        throw new UnsupportedOperationException("Unimplemented method 'getAllSavingsAccounts'");
    }

    @Override
    public List<Account> getAllCheckingsAccounts(Long userId) {
        throw new UnsupportedOperationException("Unimplemented method 'getAllCheckingsAccounts'");
    }

    @Override
    public Account getAccountById(Long accountId) throws AccountNotFoundException {
        throw new UnsupportedOperationException("Unimplemented method 'getAccountById'");
    }

    @Override
    public Account updateUserAccount(Long userId, AccountDto account) throws AccountNotFoundException {
        // To update for both checking and savings account, we need to check the account type and then update accordingly (for a future implementation)
        Account existingAccount = accountRepository.findById(userId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        BeanUtils.copyProperties(account, existingAccount);
        return accountRepository.save(existingAccount);
    }

    @Override
    public void deleteAccount(Long userId) {
        accountRepository.deleteById(userId);
    }
}
