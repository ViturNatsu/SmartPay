package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {

    Account createAccountForUser(Account account, long id) throws UserNotFoundException;

    Account addAccount(Account account)throws UserNotFoundException;

    List<AccountDto> getAccounts(Long userId, AccountType type) throws UserNotFoundException;

    List<AccountDto> getAllAccounts();

    AccountDto getAccountById(Long accountId) throws AccountNotFoundException;

    Account updateUserAccount(Long id, Account account) throws AccountNotFoundException;

    void deleteAccount(Long id);
}
