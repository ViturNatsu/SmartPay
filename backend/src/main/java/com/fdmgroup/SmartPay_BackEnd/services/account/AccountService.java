package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;

public interface AccountService {

    Account addAccount(Account account)throws UserNotFoundException;

    List<AccountDto> getAccounts(Long userId, AccountType type) throws  UserNotFoundException;

    Account getAccountById(Long accountId) throws AccountNotFoundException;

    Account updateUserAccount(Long id, Account account) throws AccountNotFoundException;

    void deleteAccount(Long id);
}
