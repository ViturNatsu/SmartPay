package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;

@Service
public interface AccountService {

    Account createAccountForUser(Account account, long id) throws UserNotFoundException;

    Account addAccount(Account account)throws UserNotFoundException;

    Optional<Account> matchMaskedAccount(Long userId, String maskedAccount);

    void setAccountStatus(Account account, boolean status) throws AccountNotFoundException;

    List<AccountDto> getAccounts(Long userId, AccountType type) throws UserNotFoundException;

    List<AccountDto> getInactiveAccounts(Long userId, String institution) throws UserNotFoundException;

    List<AccountDto> getAllAccounts();

    AccountDto getAccountById(Long accountId) throws AccountNotFoundException;

    Account updateUserAccount(Long id, Account account) throws AccountNotFoundException;

    Account updateAccountUsers(Long accountId, List<Long> userIds) throws AccountNotFoundException, UserNotFoundException;

    void deleteAccount(Long id);
}
