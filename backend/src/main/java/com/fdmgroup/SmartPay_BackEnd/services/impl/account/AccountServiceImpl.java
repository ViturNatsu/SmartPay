package com.fdmgroup.SmartPay_BackEnd.services.impl.account;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.Utility.AccountFactory;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;

@Service
public class AccountServiceImpl implements AccountService{
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountFactory accountFactory;
    
     public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository,AccountFactory accountFactory) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountFactory = accountFactory;
    }

    @Override
    public Account addAccount(Account account) throws UserNotFoundException {
         // 1. Validate User
        User user = userRepository.findById(account.getUser().getId())
                .orElseThrow(() -> new UserNotFoundException("User with id: " + account.getUser().getId() + " not found"));

        // 2. Create a new account
        Account newAccount = accountFactory.createAccount(account.getType());

        // 3. Manual mapping (BeanUtils will silently fail instead of giving compile error)
        newAccount.setAccountName(account.getAccountName());
        newAccount.setBalance(account.getBalance());
        newAccount.setUser(user);
        user.getAccounts().add(newAccount);

        return accountRepository.save(newAccount);
    }

    @Override
    public List<AccountDto> getAccounts(Long userId, AccountType type) throws  UserNotFoundException{
        if(!userRepository.existsById(userId)){
            throw  new UserNotFoundException("User not found with id: " + userId);
        }
        List<Account> accounts =
                (type == null)
                        ? accountRepository.findByUserId(userId)
                        : accountRepository.findByUserIdAndClazz(userId, type.getEntityClass());

        return accounts.stream()
        .map(a -> new AccountDto(
                a.getId(),
                a.getAccountName(),
<<<<<<< HEAD
                a.getAccountNumber(),
=======
>>>>>>> 6c6e899 (Implement auth/session fixes for token refresh and OTP flow)
                a.getBalance(),
                a.getType(),
                a.getUser() != null ? a.getUser().getId() : null
        ))
        .toList();
    }


    @Override
    public Account getAccountById(Long accountId) throws AccountNotFoundException {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));
    }

    @Override
    public Account updateUserAccount(Long accountId, Account updateAccount) throws AccountNotFoundException {
        // To update for both checking and savings account, we need to check the account type and then update accordingly (for a future implementation)
        Account existingAccount = accountRepository.findById(accountId).orElseThrow(() -> new AccountNotFoundException("Account not found"));
        existingAccount.setAccountName(updateAccount.getAccountName());
        existingAccount.setBalance(updateAccount.getBalance());
        return accountRepository.save(existingAccount);
    }

    @Override
    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);
    }
}
