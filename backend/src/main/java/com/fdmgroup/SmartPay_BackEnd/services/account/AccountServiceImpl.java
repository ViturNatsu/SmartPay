package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.Utility.AccountFactory;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountFactory accountFactory;

    public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository,
                              AccountFactory accountFactory) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountFactory = accountFactory;
    }

    public Account createAccountForUser(Account account, long id) {
        /*User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id: " + id + " not found"));
        Account newAccount = accountFactory.createAccount(account.getType());
        newAccount.setAccountName(account.getAccountName());
        newAccount.setBalance(account.getBalance());
        newAccount.setUser(user);
        return addAccount(newAccount);*/
        return addAccount(account);
    }

    @Override
    public Account addAccount(Account account) throws UserNotFoundException {
        // 1. Validate User
        User user = userRepository.findById(account.getUser().getId())
                .orElseThrow(
                        () -> new UserNotFoundException("User with id: " + account.getUser().getId() + " not found"));

        // 2. Validate Account

            if (account.getInstitutionNumber() != null && !account.getInstitutionNumber().matches("\\d{3}")) {
                throw new IllegalArgumentException("Institution number must be exactly 3 digits");
            }
            if (account.getTransitNumber() != null && !account.getTransitNumber().matches("\\d{5}")) {
                throw new IllegalArgumentException("Transit number must be exactly 5 digits");
            }
            if (account.getAccountNumber() != null && !account.getAccountNumber().matches("\\d{7,12}")) {
                throw new IllegalArgumentException("Account number must be between 7 and 12 digits");
            }
            if (accountRepository.findByAccountNumber(account.getAccountNumber()).isPresent()) {
                throw new IllegalArgumentException("Account with this account number already exists");
            }


        // 3. Create a new account
        Account newAccount = accountFactory.createAccount(account.getType());

        // 4. Manual mapping (BeanUtils will silently fail instead of giving compile
        // error)
        newAccount.setAccountName(account.getAccountName());
        newAccount.setBalance(account.getBalance()!=null ? account.getBalance() : 1000.0);
        newAccount.setUser(user);
        newAccount.setAccountNumber(account.getAccountNumber());


        newAccount.setTransitNumber(account.getTransitNumber());
        newAccount.setInstitutionNumber(account.getInstitutionNumber());


        newAccount.setActive(account.getActive() != null ? account.getActive() : true);



        // 5. Add account to user and save in repo
        return accountRepository.save(newAccount);
    }

    @Override
    public List<AccountDto> getAccounts(Long userId, AccountType type) throws UserNotFoundException {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        List<Account> accounts = (type == null)
                ? accountRepository.findByUserId(userId)
                : accountRepository.findByUserIdAndClazz(userId, type.getEntityClass());

        return accounts.stream()
                .map(a -> new AccountDto(
                        a.getId(),
                        a.getAccountName(),
                        a.getAccountNumber(),
                        a.getInstitutionNumber(),
                        a.getTransitNumber(),
                        a.getBalance(),
                        a.getType(),
                        a.getUser() != null ? a.getUser().getId() : null,
                        a.getActive()))
                .toList();
    }

    public List<AccountDto> getAllAccounts() {

        List<AccountDto> accountDtos;

        accountDtos = accountRepository.findAll().stream().map(account -> new AccountDto(account.getId(),
                account.getAccountName(),
                account.getAccountNumber(),
                account.getInstitutionNumber(),
                account.getTransitNumber(),
                account.getBalance(),
                account.getType(),
                account.getUser().getId(),
                account.getActive())).toList();
        return accountDtos;

    }

    @Override
    public Account getAccountById(Long accountId) throws AccountNotFoundException {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));
    }

    @Override
    public Account updateUserAccount(Long accountId, Account updateAccount) throws AccountNotFoundException {
        // To update for both checking and savings account, we need to check the account
        // type and then update accordingly (for a future implementation)
        Account existingAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found"));
        existingAccount.setAccountName(updateAccount.getAccountName());
        existingAccount.setBalance(updateAccount.getBalance());
        existingAccount.setActive(updateAccount.getActive());
        return accountRepository.save(existingAccount);
    }

    @Override
    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);
    }
}
