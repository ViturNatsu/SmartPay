package com.fdmgroup.SmartPay_BackEnd.services.impl.account;

import java.util.List;
import java.util.Optional;

import javax.security.auth.login.AccountNotFoundException;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.SavingsAccount;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;

@Service
public class AccountServiceImpl implements AccountService{
    private AccountRepository accountRepository;
    private UserRepository userRepository;
    
     public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Account addAccount(AccountDto accountDTO) throws com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException {
        User user = userRepository.findById(accountDTO.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User with id: " + accountDTO.getUserId() + " not found"));

        Account account = null;

        if(accountDTO.getAccountType().equals("savings")){
            account = new SavingsAccount();
        }
        else if(accountDTO.getAccountType().equals("checking")){
            account = new CheckingAccount();
        }

        BeanUtils.copyProperties(accountDTO, account);

        // user.addAccount(account);

        account.setUser(user);

        return accountRepository.save(account);
    }

    @Override
    public List<Account> getAllAccounts(Long userId) throws UserNotFoundException {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new UserNotFoundException("User not found with id: " + userId);
        }
        return user.get().getAccounts();
    }

    @Override
    public List<Account> getAllSavingsAccounts(Long userId) throws UserNotFoundException {
        List<Account> allAccounts = getAllAccounts(userId);
        List<Account> savingsAccounts = allAccounts.stream()
                .filter(account -> account instanceof com.fdmgroup.SmartPay_BackEnd.domain.entities.account.SavingsAccount)
                .toList();
        return savingsAccounts;
    }

    @Override
    public List<Account> getAllCheckingsAccounts(Long userId) throws UserNotFoundException {
        List<Account> allAccounts = getAllAccounts(userId);
        List<Account> checkingAccounts = allAccounts.stream()
                .filter(account -> account instanceof com.fdmgroup.SmartPay_BackEnd.domain.entities.account.CheckingAccount)
                .toList();
        return checkingAccounts;
    }

    @Override
    public Account getAccountById(Long accountId) throws AccountNotFoundException {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));
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
