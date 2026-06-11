package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.paymentmethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;

@Service
public class WalletServiceImpl implements WalletService {

    private static final String INSUFFICIENT_BANK_FUNDS_MESSAGE =
            "Insufficient funds in this account. Please check your bank balance and try again.";

    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserService userService;
    private final PaymentMethodService paymentMethodService;

    public WalletServiceImpl(
            WalletRepository walletRepository,
            PaymentRepository paymentRepository,
            AccountRepository accountRepository,
            WalletTransactionRepository walletTransactionRepository,
            UserService userService,
            PaymentMethodService paymentMethodService) {
        this.walletRepository = walletRepository;
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.userService = userService;
        this.paymentMethodService = paymentMethodService;
    }

    @Transactional
    @Override
    public Wallet createWallet(long userId) {
        Wallet wallet = new Wallet();
        wallet.setUser(userService.getUserById(userId));
        wallet.setBalance(0.0);
        return walletRepository.save(wallet);
    }

    @Transactional
    @Override
    public WalletResponseDTO getWalletByUserId(long userId) {
        Optional<Wallet> optionalWallet = walletRepository.findByUserId(userId);
        Wallet wallet = optionalWallet.orElseThrow();
        return mapToDto(wallet);

    }

    @Override
    @Transactional
    public WalletResponseDTO loadFunds(long userId, LoadWalletRequestDTO request) {
        PaymentMethod paymentMethod = paymentRepository
                .findByPaymentMethodIdAndUser_Id(request.getPaymentMethodId(), userId)
                .orElseThrow(() -> new PaymentMethodNotFoundException("Payment method not found"));

        if (!Boolean.TRUE.equals(paymentMethod.getActive())) {
            throw new PaymentMethodNotFoundException("Payment method not found");
        }

        Account account = paymentMethod.getAccount();
        double amount = request.getAmount();
        double accountBalance = account.getBalance() != null ? account.getBalance() : 0.0;

        if (accountBalance < amount) {
            throw new InsufficientFundsException(INSUFFICIENT_BANK_FUNDS_MESSAGE);
        }

        account.setBalance(accountBalance - amount);
        accountRepository.save(account);


        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();
        double walletBalance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        wallet.setBalance(walletBalance + amount);
        Wallet savedWallet = walletRepository.save(wallet);

        recordTransaction(savedWallet, WalletTransactionType.LOAD, amount, paymentMethod);
        return mapToDto(savedWallet);
    }

    @Override
    @Transactional
    public WalletResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request) {
        // Scenario 8: reject zero / negative / null amounts
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        Optional<Wallet> optionalWallet = walletRepository.findByUserId(userId);
        Wallet wallet = optionalWallet.orElseThrow();

        LocalDate today = LocalDate.now();

        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(today)) {
            wallet.setDailySpentDate(today);
            wallet.setDailySpentAmount(0.0);
        }

        if (wallet.getPerTransactionLimit() != null
                && request.getAmount() > wallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet per-transaction limit of $"
                            + String.format("%.2f", wallet.getPerTransactionLimit()));
        }

        if (wallet.getDailySpendingLimit() != null
                && wallet.getDailySpentAmount() + request.getAmount() > wallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet daily spending limit of $"
                            + String.format("%.2f", wallet.getDailySpendingLimit()));
        }

        // Scenario 7: reject amounts that exceed available balance
        if (request.getAmount() > wallet.getBalance()) {
            throw new InsufficientFundsException(
                "You cannot withdraw more than the Wallet balance of $"
                + String.format("%.2f", wallet.getBalance()));
        }

        // Verify the destination payment method is active and belongs to this user
        PaymentMethod paymentMethod = paymentMethodService.findPaymentMethodById(request.getPaymentMethodId());
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new InvalidWithdrawAmountException("Payment method does not belong to this user");
        }
        if (Boolean.FALSE.equals(paymentMethod.getActive())) {
            throw new InvalidWithdrawAmountException("Selected payment method is not active");
        }

        // Deduct the amount and persist
        wallet.setBalance(wallet.getBalance() - request.getAmount());
        
        wallet.setDailySpentAmount(wallet.getDailySpentAmount() + request.getAmount());
        wallet.setDailySpentDate(today);

        Wallet savedWallet = walletRepository.save(wallet);
        recordTransaction(savedWallet, WalletTransactionType.WITHDRAW, request.getAmount(), paymentMethod);
        return mapToDto(wallet);
    }

    @Override
    public List<WalletTransactionDTO> getTransactions(long userId, int limit) {
        int pageSize = Math.min(Math.max(limit, 1), 50);
        return walletTransactionRepository
                .findByWallet_User_IdOrderByCreatedAtDesc(userId, PageRequest.of(0, pageSize))
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void transfer(Long senderUserId, Long recipientUserId, Double amount, String memo) {
        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
        .orElseThrow(() -> new RuntimeException("Sender wallet not found"));

        LocalDate today = LocalDate.now();

        System.out.println("TRANSFER AMOUNT = " + amount);
        System.out.println("PER TX LIMIT = " + senderWallet.getPerTransactionLimit());
        System.out.println("DAILY LIMIT = " + senderWallet.getDailySpendingLimit());
        System.out.println("DAILY SPENT = " + senderWallet.getDailySpentAmount());
            
        if (amount == null || amount <= 0) {
            throw new InvalidWithdrawAmountException(
                "Amount must be greater than $0.00"
            );
        }

        if (senderWallet.getBalance() < amount) {
            throw new InsufficientFundsException(
                "Insufficient wallet balance"
            );
        }

        if (senderWallet.getDailySpentDate() == null 
                || !senderWallet.getDailySpentDate().equals(today)) {
            senderWallet.setDailySpentDate(today);
            senderWallet.setDailySpentAmount(0.0);
        }

        if (senderWallet.getPerTransactionLimit() != null
                && amount > senderWallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transfer exceeds your wallet per-transaction limit of $"
                            + String.format("%.2f", senderWallet.getPerTransactionLimit()));
        }

        if (senderWallet.getDailySpendingLimit() != null
                && senderWallet.getDailySpentAmount() + amount > senderWallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transfer exceeds your wallet daily spending limit of $"
                            + String.format("%.2f", senderWallet.getDailySpendingLimit()));
        }

        Wallet recipientWallet = walletRepository.findByUserId(recipientUserId)
        .orElseGet(() -> createWallet(recipientUserId));

        senderWallet.setBalance(
            Math.round((senderWallet.getBalance() - amount) * 100.0) / 100.0
        );

        senderWallet.setDailySpentAmount(
            senderWallet.getDailySpentAmount() + amount
        );
        senderWallet.setDailySpentDate(today);

        walletRepository.save(senderWallet);

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0) / 100.0);
        walletRepository.save(recipientWallet);
    }

    private void recordTransaction(Wallet wallet, WalletTransactionType type, double amount, PaymentMethod paymentMethod) {
        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setPaymentMethodId(paymentMethod.getPaymentMethodId());
        transaction.setBankDisplayName(paymentMethod.getBankDisplayName());
        transaction.setStatus("COMPLETED");
        walletTransactionRepository.save(transaction);
    }

    private WalletTransactionDTO toDto(WalletTransaction transaction) {
        WalletTransactionDTO dto = new WalletTransactionDTO();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setBankDisplayName(transaction.getBankDisplayName());
        dto.setDescription(buildDescription(transaction));
        dto.setStatus(transaction.getStatus());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }

    private String buildDescription(WalletTransaction transaction) {
        String bank = transaction.getBankDisplayName() != null
                ? transaction.getBankDisplayName()
                : "linked bank account";
        if (transaction.getType() == WalletTransactionType.LOAD) {
            return "Wallet load from " + bank;
        }
        return "Withdraw to " + bank;
    }

    private WalletResponseDTO mapToDto(Wallet wallet){
        WalletResponseDTO walletResponseDTO = new WalletResponseDTO();
        
        walletResponseDTO.setBalance(wallet.getBalance());
        walletResponseDTO.setWallet_id(wallet.getWalletId());

        walletResponseDTO.setDailySpendingLimit(wallet.getDailySpendingLimit());
        walletResponseDTO.setPerTransactionLimit(wallet.getPerTransactionLimit());
        walletResponseDTO.setDailySpentAmount(wallet.getDailySpentAmount());
        return walletResponseDTO;
    }

    

    @Override
    @Transactional
    public WalletResponseDTO updateDailySpendingLimit(long userId,
                                       WalletDailyLimitRequestDTO request) {

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if (request.getDailySpendingLimit() == null) {
            wallet.setDailySpendingLimit(null);
            Wallet savedWallet = walletRepository.save(wallet);
            return mapToDto(savedWallet);
        }

        if (request.getDailySpendingLimit() <= 0) {
            throw new InvalidWithdrawAmountException(
                    "Daily spending limit must be greater than $0.00");
        }

        wallet.setDailySpendingLimit(request.getDailySpendingLimit());

        Wallet savedWallet = walletRepository.save(wallet);
        return mapToDto(savedWallet);
    }

    /**
     * Updates the wallet-level per-transaction spending limit.
     *
     * Validation rules:
     * 1. Limit must not be null
     * 2. Limit must be greater than $0.00
     *
     * The limit applies to any single outgoing wallet transaction,
     * regardless of which linked funding source is used.
     */
    @Override
    @Transactional
    public WalletResponseDTO  updatePerTransactionLimit(long userId,
                                        WalletPerTransactionLimitRequestDTO request) {

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if (request.getPerTransactionLimit() == null) {
            wallet.setPerTransactionLimit(null);
            Wallet savedWallet = walletRepository.save(wallet);
            return mapToDto(savedWallet);
        }

        if (request.getPerTransactionLimit() <= 0) {
            throw new WalletLimitExceededException(
                    "Per-transaction limit must be greater than $0.00");
        }

        wallet.setPerTransactionLimit(request.getPerTransactionLimit());
        
        Wallet savedWallet = walletRepository.save(wallet);
        return mapToDto(savedWallet);
    }
}
