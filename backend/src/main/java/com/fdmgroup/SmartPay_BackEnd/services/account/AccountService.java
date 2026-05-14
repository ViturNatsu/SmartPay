package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import org.springframework.stereotype.Service;

@Service
public interface AccountService {

    Account createAccountForUser(Account account, long id) throws UserNotFoundException;

    Account addAccount(Account account)throws UserNotFoundException;

    Optional<Account> matchAccountDigest(String maskedAccount);

    void setAccountStatus(Account account, boolean status) throws AccountNotFoundException;

    List<AccountDTO> getAccounts(Long userId, AccountType type) throws UserNotFoundException;

    List<AccountDTO> getInactiveAccounts(Long userId, String institution) throws UserNotFoundException;

    List<AccountDTO> getAllAccounts();

    AccountDTO getAccountById(Long accountId) throws AccountNotFoundException;

    Account updateUserAccount(Long id, Account account) throws AccountNotFoundException;

    Account updateAccountUsers(Long accountId, List<Long> userIds) throws AccountNotFoundException, UserNotFoundException;

    void deleteAccount(Long id);
}
