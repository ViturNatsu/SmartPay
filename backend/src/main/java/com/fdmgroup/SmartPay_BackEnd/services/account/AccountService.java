package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;

import javax.security.auth.login.AccountNotFoundException;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;

public interface AccountService {

    Account addAccount(AccountDto accountDTO)throws UserNotFoundException;

    List<Account> getAllAccounts(Long userId) throws UserNotFoundException;

    List<Account> getAllSavingsAccounts(Long userId) throws UserNotFoundException;

    List<Account> getAllCheckingsAccounts(Long userId) throws UserNotFoundException;

    Account getAccountById(Long accountId) throws AccountNotFoundException;

    Account updateUserAccount(Long id, AccountDto account) throws AccountNotFoundException;

    void deleteAccount(Long id);
}
