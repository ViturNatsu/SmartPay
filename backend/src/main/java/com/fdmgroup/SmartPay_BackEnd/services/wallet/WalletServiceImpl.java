package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.paymentmethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

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
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();
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

    /**
     * Validates amount, spending limits, payment method ownership, then deducts
     * the balance and persists a WalletTransaction with a unique TXN-{UUID} ID.
     * Returns a WithdrawResponseDTO containing the transaction ID and new balance.
     */
    @Override
    @Transactional
    public WithdrawResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

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

        if (request.getAmount() > wallet.getBalance()) {
            throw new InsufficientFundsException(
                "You cannot withdraw more than the Wallet balance of $"
                + String.format("%.2f", wallet.getBalance()));
        }

        PaymentMethod paymentMethod = paymentMethodService.findPaymentMethodById(request.getPaymentMethodId());
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new InvalidWithdrawAmountException("Payment method does not belong to this user");
        }
        if (Boolean.FALSE.equals(paymentMethod.getActive())) {
            throw new InvalidWithdrawAmountException("Selected payment method is not active");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        wallet.setDailySpentAmount(wallet.getDailySpentAmount() + request.getAmount());
        wallet.setDailySpentDate(today);
        Wallet savedWallet = walletRepository.save(wallet);

        WalletTransaction tx = recordTransaction(savedWallet, WalletTransactionType.WITHDRAW, request.getAmount(), paymentMethod);

        WithdrawResponseDTO response = new WithdrawResponseDTO();
        response.setTransactionId(tx.getTransactionId());
        response.setNewBalance(savedWallet.getBalance());
        response.setAmount(request.getAmount());
        response.setCreatedAt(tx.getCreatedAt());
        return response;
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

        if (amount == null || amount <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        if (senderWallet.getBalance() < amount) {
            throw new InsufficientFundsException("Insufficient wallet balance");
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

        senderWallet.setBalance(Math.round((senderWallet.getBalance() - amount) * 100.0) / 100.0);
        senderWallet.setDailySpentAmount(senderWallet.getDailySpentAmount() + amount);
        senderWallet.setDailySpentDate(today);
        walletRepository.save(senderWallet);

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0) / 100.0);
        walletRepository.save(recipientWallet);
    }

    @Override
    @Transactional
    public WalletResponseDTO updateDailySpendingLimit(long userId, WalletDailyLimitRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if (request.getDailySpendingLimit() == null) {
            wallet.setDailySpendingLimit(null);
            return mapToDto(walletRepository.save(wallet));
        }

        if (request.getDailySpendingLimit() <= 0) {
            throw new InvalidWithdrawAmountException("Daily spending limit must be greater than $0.00");
        }

        wallet.setDailySpendingLimit(request.getDailySpendingLimit());
        return mapToDto(walletRepository.save(wallet));
    }

    @Override
    @Transactional
    public WalletResponseDTO updatePerTransactionLimit(long userId, WalletPerTransactionLimitRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if (request.getPerTransactionLimit() == null) {
            wallet.setPerTransactionLimit(null);
            return mapToDto(walletRepository.save(wallet));
        }

        if (request.getPerTransactionLimit() <= 0) {
            throw new WalletLimitExceededException("Per-transaction limit must be greater than $0.00");
        }

        wallet.setPerTransactionLimit(request.getPerTransactionLimit());
        return mapToDto(walletRepository.save(wallet));
    }

    private WalletTransaction recordTransaction(
            Wallet wallet,
            WalletTransactionType type,
            double amount,
            PaymentMethod paymentMethod) {
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setPaymentMethodId(paymentMethod.getPaymentMethodId());
        transaction.setBankDisplayName(paymentMethod.getBankDisplayName());
        transaction.setStatus("COMPLETED");
        transaction.setCreatedAt(LocalDateTime.now());
        return walletTransactionRepository.save(transaction);
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

    private WalletResponseDTO mapToDto(Wallet wallet) {
        WalletResponseDTO dto = new WalletResponseDTO();
        dto.setBalance(wallet.getBalance());
        dto.setWallet_id(wallet.getWalletId());
        dto.setDailySpendingLimit(wallet.getDailySpendingLimit());
        dto.setPerTransactionLimit(wallet.getPerTransactionLimit());
        dto.setDailySpentAmount(wallet.getDailySpentAmount());
        dto.setDailySpentDate(wallet.getDailySpentDate());
        return dto;
    }
}
