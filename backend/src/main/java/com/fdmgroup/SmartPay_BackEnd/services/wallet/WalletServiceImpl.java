package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Override
    public Wallet getWalletByUserId(long userId) {
        Optional<Wallet> wallet = walletRepository.findByUserId(userId);
        if (wallet.isEmpty()) {
            Wallet newWallet = new Wallet();
            newWallet.setUser(userService.getUserById(userId));
            newWallet.setBalance(0.0);
            return walletRepository.save(newWallet);
        }
        return wallet.get();
    }

    @Override
    @Transactional
    public Wallet loadFunds(long userId, LoadWalletRequestDTO request) {
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

        Wallet wallet = getWalletByUserId(userId);
        double walletBalance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        wallet.setBalance(walletBalance + amount);
        Wallet savedWallet = walletRepository.save(wallet);

        recordTransaction(savedWallet, WalletTransactionType.LOAD, amount, paymentMethod);
        return savedWallet;
    }

    @Override
    @Transactional
    public Wallet withdrawFunds(long userId, WithdrawRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        Wallet wallet = getWalletByUserId(userId);

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
        Wallet savedWallet = walletRepository.save(wallet);

        recordTransaction(savedWallet, WalletTransactionType.WITHDRAW, request.getAmount(), paymentMethod);
        return savedWallet;
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
        Wallet senderWallet = getWalletByUserId(senderUserId);

        if (senderWallet.getBalance() < amount) {
            throw new InsufficientFundsException("Insufficient wallet balance to complete this transfer.");
        }

        Wallet recipientWallet = getWalletByUserId(recipientUserId);

        senderWallet.setBalance(Math.round((senderWallet.getBalance() - amount) * 100.0) / 100.0);
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
}
