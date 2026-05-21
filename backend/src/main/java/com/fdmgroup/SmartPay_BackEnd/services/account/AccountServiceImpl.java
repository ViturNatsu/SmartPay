package com.fdmgroup.SmartPay_BackEnd.services.account;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.Utility.AccountFactory;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountFilterParamDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountFactory accountFactory;
    private final MaskingUtil maskingUtil;

    Logger log = LoggerFactory.getLogger(AccountServiceImpl.class);

    public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository,
                              AccountFactory accountFactory, MaskingUtil maskingUtil) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountFactory = accountFactory;
        this.maskingUtil = maskingUtil;
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
        // No Longer needed

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
        newAccount.setBalance(account.getBalance() != null ? account.getBalance() : 1000.0);
        // newAccount.setUser(user);
        // newAccount.getUsers().add(user);
        newAccount.setAccountNumber(account.getAccountNumber() != null ? account.getAccountNumber() : newAccount.getAccountNumber());
        newAccount.setTransitNumber(account.getTransitNumber());
        newAccount.setInstitutionNumber(account.getInstitutionNumber());
        newAccount.setActive(account.getActive() != null ? account.getActive() : true);

        // 5. Add account to user and save in repo
        // user.getAccounts().add(newAccount);
        return accountRepository.save(newAccount);
    }

    /**
     * Retrieve all the user's accounts that match the filter
     * @param userId A Long userId
     * @param filter An AccountFilterParamDTO object with optional filter params
     * @return A list of matching Accounts represented as their DTO objects
     * @throws UserNotFoundException
     */
    @Override
    public List<AccountDTO> getAccounts(Long userId, AccountFilterParamDTO filter) throws UserNotFoundException {
        User user = userRepository
          .findById(userId).orElseThrow(
            () -> new UserNotFoundException("User not found with id: " + userId));

        log.info("filter");
        log.info("{}", filter);
        return accountRepository.findByUserId(userId).stream()
          .filter((filter::match))
          .map(this::accountToDto)
          .toList();
    }

    /**
     * A filter method used in matching Accounts based on their hashed accountNumber
     * @param accountNumberDigest A String hash value
     * @return An Optional containing an Account if a match is found
     */
    @Override
    public Optional<Account> matchAccountDigest(String accountNumberDigest) {
        return accountRepository.findAll().stream()
          .filter(account ->
            accountNumberDigest.equals(maskingUtil.maskAccountNumber(account.getAccountNumber()).getSecond())
          )
          .findFirst();
    }

    /**
     * Setter method for Accounts, used in activating and deactivating accounts.
     * @param account An Account object to update
     * @param accountStatus A boolean corresponding to the new Account status
     */
    @Override
    @Transactional
    public void setAccountStatus(Account account, boolean accountStatus){
        account.setActive(accountStatus);
        accountRepository.save(account);
    }

    /**
     * Getter method for AccountDTOs
     * @return returns a List of AccountDTOs for all accounts in the DB
     */
    @Override
    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findAll().stream().map(this::accountToDto).toList();
    }

    /**
     * Getter method for AccountDTOs given an accountId
     * @param accountId A Long corresponding to the account's accountId
     * @return An AccountDTO of the target Account
     * @throws AccountNotFoundException
     */
    @Override
    public AccountDTO getAccountById(Long accountId) throws AccountNotFoundException {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));
        return accountToDto(account);
    }


    /**
     * Transactional method that updates a given account idempotently
     * @param accountId Long corresponding to the target account's accountId
     * @param updateAccount An Account object holding the new field values
     * @return An Account object corresponding to the updated account
     * @throws AccountNotFoundException
     */
    @Override
    @Transactional
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

    /**
     * Transactional method to delete an Account given an ID
     * @param accountId a Long representing the accountId to be deleted
     */
    @Override
    @Transactional
    public void deleteAccount(Long accountId) {
        accountRepository.deleteById(accountId);
    }

    /**
     * Utility method to convert accounts to their DTO before transmission
     * @param account The Account to convert
     * @return An AccountDTO object corresponding to account
     */
    private AccountDTO accountToDto(Account account){
        Pair<String, String> masked = maskingUtil.maskAccountNumber(account.getAccountNumber());
        return new AccountDTO(
          account.getId(),
          account.getAccountName(),
          masked.getFirst(),
          masked.getSecond(),
          account.getInstitutionNumber(),
          account.getTransitNumber(),
          account.getBalance(),
          account.getType(),
          account.getUsers() != null ? account.getUsers() : null,
          account.getActive()
        );
    }

    /**
     * Utility method to convert accounts to their DTO before transmission
     * @param account The Account to convert
     * @return An AccountDTO object corresponding to account
     */
    private AccountDTO accountToDtoUserLimited(Account account, List<User> users){
        Pair<String, String> masked = maskingUtil.maskAccountNumber(account.getAccountNumber());
        return new AccountDTO(
          account.getId(),
          account.getAccountName(),
          masked.getFirst(),
          masked.getSecond(),
          account.getInstitutionNumber(),
          account.getTransitNumber(),
          account.getBalance(),
          account.getType(),
          users != null ? users : null,
          account.getActive()
        );
    }

    /**
     * Transactional method to update the users associated with an account
     * @param accountId a Long representing the accountId to be updated
     * @param userIds a List of Longs representing the new user IDs
     * @return An Account object corresponding to the updated account
     * @throws AccountNotFoundException
     * @throws UserNotFoundException
     */
    @Override
    public Account updateAccountUsers(Long accountId, List<Long> userIds) throws AccountNotFoundException, UserNotFoundException {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with id: " + accountId));

        List<User> newUsers = userIds.stream()
                .map(userId -> userRepository.findById(userId)
                        .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId)))
                .toList();

        account.getUsers().clear();
        account.getUsers().addAll(newUsers);

        return accountRepository.save(account);
    }

    @Override
    public List<AccountDTO> getInUseAccounts(Long userId) {
        List<Account> userAccounts = accountRepository.findInUseAccountsByUserId(userId);
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        List<User> users = new ArrayList<>();
        users.add(user);
        return userAccounts.stream()
                .map(account -> accountToDtoUserLimited(account, users))
                .toList();
    }
}
