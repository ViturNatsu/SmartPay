package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletTransactionForbiddenAccessException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletTransactionNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import com.fdmgroup.SmartPay_BackEnd.services.paymentMethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionPageDTO;

import lombok.AllArgsConstructor;
import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.Utility.StringHelper;

@Service
@AllArgsConstructor
public class WalletServiceImpl implements WalletService {

    private static final String INSUFFICIENT_BANK_FUNDS_MESSAGE =
            "Insufficient funds in this account. Please check your bank balance and try again.";

    private static final Double LOW_BALANCE_THRESHOLD = 250.0;

    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final PayeeRepository payeeRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserService userService;
    private final PaymentMethodService paymentMethodService;
    private final NotificationService notificationService;

    private StringHelper helper;

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

        WalletTransaction loadTx = recordTransaction(savedWallet, WalletTransactionType.LOAD, amount, paymentMethod, RailType.BANK_TRANSFER);
        WalletResponseDTO dto = mapToDto(savedWallet);
        dto.setTransactionId(loadTx.getTransactionId());
        return dto;
    }

    /**
     * Validates amount, spending limits, payment method ownership, then deducts
     * the balance and persists a WalletTransaction with a unique TXN-{UUID} ID.
     * Returns a WithdrawResponseDTO containing the transaction ID and new balance.
     */
    @Override
    @Transactional
    public WithdrawResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() < 1) {
            throw new InvalidWithdrawAmountException("Amount must be at least $1.00");
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

        maybeNotifyLowBalance(userId, savedWallet.getBalance());

        WalletTransaction tx = recordTransaction(savedWallet, WalletTransactionType.WITHDRAW, request.getAmount(), paymentMethod, RailType.BANK_TRANSFER);

        WithdrawResponseDTO response = new WithdrawResponseDTO();
        response.setTransactionId(tx.getTransactionId());
        response.setNewBalance(savedWallet.getBalance());
        response.setAmount(request.getAmount());
        response.setCreatedAt(tx.getCreatedAt());
        return response;
    }

    @Override
    public WalletTransactionPageDTO getTransactions(long userId, int page, int limit, Boolean favourite, String search) {
        int pageNumber = Math.max(page, 0);
        int pageSize = Math.min(Math.max(limit, 1), 50);
        boolean hasSearch = search != null && !search.isBlank();
        String cleanedSearch = hasSearch ? search.trim() : null;

        PageRequest pageRequest = PageRequest.of(pageNumber, pageSize);

        Page<WalletTransaction> transactionPage;

        if (Boolean.TRUE.equals(favourite) && hasSearch) {
            transactionPage = walletTransactionRepository
                    .searchFavouriteTransactions(
                            userId,
                            cleanedSearch,
                            pageRequest);

        } else if (Boolean.TRUE.equals(favourite)) {
            transactionPage = walletTransactionRepository
                    .findByWallet_User_IdAndIsFavouriteTrueOrderByCreatedAtDesc(
                            userId,
                            pageRequest);

        } else if (hasSearch) {
            transactionPage = walletTransactionRepository
                    .searchTransactions(
                            userId,
                            cleanedSearch,
                            pageRequest);

        } else {
            transactionPage = walletTransactionRepository
                    .findByWallet_User_IdOrderByCreatedAtDesc(
                            userId,
                            pageRequest);
        }

        WalletTransactionPageDTO response = new WalletTransactionPageDTO();

        response.setTransactions(
                transactionPage.getContent()
                        .stream()
                        .map(this::toDto)
                        .collect(Collectors.toList()));

        response.setCurrentPage(transactionPage.getNumber());
        response.setPageSize(transactionPage.getSize());
        response.setTotalPages(transactionPage.getTotalPages());
        response.setTotalElements(transactionPage.getTotalElements());
        response.setHasNext(transactionPage.hasNext());
        response.setHasPrevious(transactionPage.hasPrevious());

        return response;
    }

    @Override
    @Transactional
    public WalletResponseDTO transfer(Long senderUserId, Long recipientUserId, Double amount, String memo) {
        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new RuntimeException("Sender wallet not found"));

        LocalDate today = LocalDate.now();

        if (amount == null || amount < 1) {
            throw new InvalidWithdrawAmountException("Amount must be at least $1.00");
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
        Wallet savedSenderWallet = walletRepository.save(senderWallet);

        maybeNotifyLowBalance(senderUserId, savedSenderWallet.getBalance());

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0) / 100.0);
        Wallet savedRecipientWallet = walletRepository.save(recipientWallet);

        User senderUser = senderWallet.getUser();
        User recipientUser = recipientWallet.getUser();

        // Sender's TRANSFER row: prefer sender's payee nickname for the recipient
        String transferCounterparty = payeeRepository
                .findByOwnerIdAndRecipientIdAndActiveTrue(senderUserId, recipientUserId)
                .map(Payee::getPayeeName)
                .orElse(helper.fullName(recipientUser));

        // Recipient's DEPOSIT row: the sender's name (optionally recipient's payee for sender)
        String depositCounterparty = payeeRepository
                .findByOwnerIdAndRecipientIdAndActiveTrue(recipientUserId, senderUserId)
                .map(Payee::getPayeeName)
                .orElse(helper.fullName(senderUser));


        

        recordTransaction(savedRecipientWallet, WalletTransactionType.DEPOSIT, amount, depositCounterparty, RailType.WALLET_TRANSFER);
        WalletTransaction transferTx = recordTransaction(savedSenderWallet, WalletTransactionType.TRANSFER, amount ,transferCounterparty, RailType.WALLET_TRANSFER);

        notificationService.createNotification(
                senderUserId, NotificationType.SUCCESS, "Payment successful",
                "$" + String.format("%.2f", amount) + " sent to " + transferCounterparty);

        WalletResponseDTO dto = mapToDto(savedSenderWallet);
        dto.setTransactionId(transferTx.getTransactionId());
        return dto;
    }

    private void maybeNotifyLowBalance(long userId, Double balance) {
        if (balance != null && balance < LOW_BALANCE_THRESHOLD
                && !notificationService.hasActiveOfType(userId, NotificationType.WARNING)) {
            notificationService.createNotification(
                    userId, NotificationType.WARNING, "Low wallet balance",
                    "Below $" + LOW_BALANCE_THRESHOLD.intValue());
        }
    }

    @Override
    @Transactional
    public WalletResponseDTO updateDailySpendingLimit(long userId, WalletDailyLimitRequestDTO request) {
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if (request.getDailySpendingLimit() == null) {
            wallet.setDailySpendingLimit(null);
            return mapToDto(walletRepository.save(wallet));
        }

        if (request.getDailySpendingLimit() < 1) {
            throw new InvalidWithdrawAmountException("Daily spending limit must be at least $1.00");
        }

        if (request.getDailySpendingLimit() > 10000) {
            throw new InvalidWithdrawAmountException(
                "Daily spending limit cannot exceed $10,000.00");
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

        if (request.getPerTransactionLimit() < 1) {
            throw new WalletLimitExceededException("Per-transaction limit must be at least $1.00");
        }

        if (request.getPerTransactionLimit() > 10000) {
            throw new WalletLimitExceededException(
                "Per-transaction limit cannot exceed $10,000.00"
            );
        }

        wallet.setPerTransactionLimit(request.getPerTransactionLimit());
        return mapToDto(walletRepository.save(wallet));
    }

    private WalletTransaction recordTransaction(Wallet wallet, WalletTransactionType type, double amount, String name, RailType railType) {
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setCounterpartyName(name);
        transaction.setRailType(railType);
        transaction.setStatus("COMPLETED");
        transaction.setCreatedAt(Instant.now());
        return walletTransactionRepository.save(transaction);
    }

    private WalletTransaction recordTransaction(
            Wallet wallet,
            WalletTransactionType type,
            double amount,
            PaymentMethod paymentMethod,
            RailType railType) {
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8));
        transaction.setWallet(wallet);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setPaymentMethodId(paymentMethod.getPaymentMethodId());
        transaction.setBankDisplayName(paymentMethod.getBankDisplayName());
        transaction.setRailType(railType);
        transaction.setStatus("COMPLETED");
        transaction.setCreatedAt(Instant.now());
        return walletTransactionRepository.save(transaction);
    }

    private WalletTransactionDTO toDto(WalletTransaction transaction) {
        WalletTransactionDTO dto = new WalletTransactionDTO();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setRailType(transaction.getRailType());
        dto.setBankDisplayName(transaction.getBankDisplayName());
        dto.setDescription(buildDescription(transaction));
        dto.setStatus(transaction.getStatus());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setFavourite(transaction.isFavourite());
        return dto;
    }

    private String buildDescription(WalletTransaction transaction) {
    String bank = transaction.getBankDisplayName() != null && !transaction.getBankDisplayName().isBlank()
            ? transaction.getBankDisplayName()
            : "linked bank account";
    String name = transaction.getCounterpartyName();
    // Treat blank (null or whitespace-only) counterparty names as missing so the
    // UI never renders an incomplete label like "Transfer to " with no name.
    boolean hasName = name != null && !name.isBlank();

    switch (transaction.getType()) {
        case LOAD:
            return "Wallet load from " + bank;
        case WITHDRAW:
            return "Withdraw to " + bank;
        case DEPOSIT:
            return hasName ? "Received transfer from " + name : "Received transfer";
        case TRANSFER:
            return hasName ? "Transfer to " + name : "Transfer out";
        case PURCHASES:
            return "Purchase";
        default:
            return "Transaction";
        }
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

    @Override
    @Transactional
    public WalletTransactionDTO changeWalletTransactionFavouriteStatus(long userId,
            String transactionId, 
            boolean isFavourite){
        
        WalletTransaction foundWalletTransaction = 
            walletTransactionRepository.findByTransactionId(transactionId)
            .orElseThrow(()-> new WalletTransactionNotFoundException("Wallet Transaction id not found!"));
        
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        if(!foundWalletTransaction.getWallet().getWalletId().equals(wallet.getWalletId())){
            throw new WalletTransactionForbiddenAccessException("Wallet Transaction does not belong to user's wallet!");
        }
        foundWalletTransaction.setFavourite(isFavourite);
        WalletTransaction updatedWalletTransaction = walletTransactionRepository.save(foundWalletTransaction);
        return toDto(updatedWalletTransaction);
    }
}
