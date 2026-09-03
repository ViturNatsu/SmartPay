package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import java.math.BigDecimal;
import java.util.stream.Collectors;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEntityLinkUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationRelatedEntityType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationTier;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringChargeValidationUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;

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
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
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
    private final RecurringChargeValidationUtil recurringChargeValidationUtil;


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

        System.out.println("Requested amount = " + request.getAmount());
        System.out.println("Account balance = " + account.getBalance());
        System.out.println("Payment method id = " + paymentMethod.getPaymentMethodId());
        System.out.println("Account id = " + account.getAccountNumber());

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
        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ONE) < 0) {
            throw new InvalidWithdrawAmountException("Amount must be at least $1.00");
        }

        if (amount.scale() > 2) {
            throw new InvalidWithdrawAmountException(
                "Amount cannot have more than 2 decimal places"
            );
        }

        double amountValue = amount.doubleValue();

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();

        LocalDate today = LocalDate.now();
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(today)) {
            wallet.setDailySpentDate(today);
            wallet.setDailySpentAmount(0.0);
        }

        if (wallet.getPerTransactionLimit() != null
                && amountValue > wallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet per-transaction limit of $"
                            + String.format("%.2f", wallet.getPerTransactionLimit()));
        }

        if (wallet.getDailySpendingLimit() != null
                && wallet.getDailySpentAmount() + amountValue > wallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet daily spending limit of $"
                            + String.format("%.2f", wallet.getDailySpendingLimit()));
        }

        if (amountValue > wallet.getBalance()) {
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

        wallet.setBalance(wallet.getBalance() - amountValue);
        wallet.setDailySpentAmount(wallet.getDailySpentAmount() + amountValue);
        wallet.setDailySpentDate(today);
        Wallet savedWallet = walletRepository.save(wallet);

        maybeNotifyLowBalance(userId,  savedWallet.getBalance(), savedWallet.getWalletId());

        WalletTransaction tx = recordTransaction(savedWallet, WalletTransactionType.WITHDRAW, amountValue, paymentMethod, RailType.BANK_TRANSFER);

        WithdrawResponseDTO response = new WithdrawResponseDTO();
        response.setTransactionId(tx.getTransactionId());
        response.setNewBalance(savedWallet.getBalance());
        response.setAmount(amountValue);
        response.setCreatedAt(tx.getCreatedAt());
        return response;
    }

    @Override
    @Transactional
    public void debitRecurringPayment(long userId, double amount, String counterpartyName,
            LocalDate processingDate) {
        if (amount < 1) {
            throw new InvalidWithdrawAmountException("Amount must be at least $1.00");
        }

        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow();
        recurringChargeValidationUtil.validate(wallet, amount, processingDate);
        resetDailySpendIfNeeded(wallet, processingDate);

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setDailySpentAmount(wallet.getDailySpentAmount() + amount);
        wallet.setDailySpentDate(processingDate);
        Wallet savedWallet = walletRepository.save(wallet);
        recordTransaction(savedWallet, WalletTransactionType.PURCHASES, amount,
                counterpartyName, RailType.DEBIT_CARD);
    }

    private void resetDailySpendIfNeeded(Wallet wallet, LocalDate processingDate) {
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(processingDate)
                || wallet.getDailySpentAmount() == null) {
            wallet.setDailySpentDate(processingDate);
            wallet.setDailySpentAmount(0.0);
        }
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
    public WalletResponseDTO transfer(Long senderUserId, Long recipientUserId, BigDecimal amount, String memo) {
        Wallet senderWallet = walletRepository.findByUserId(senderUserId)
                .orElseThrow(() -> new RuntimeException("Sender wallet not found"));

        LocalDate today = LocalDate.now();

        if (amount == null || amount.compareTo(BigDecimal.ONE) < 0) {
            throw new InvalidWithdrawAmountException(
                "Amount must be at least $1.00"
            );
        }

        if (amount.compareTo(new BigDecimal("10000.00")) > 0) {
            throw new InvalidWithdrawAmountException(
                "Amount cannot exceed $10,000.00"
            );
        }

        double amountValue = amount.doubleValue();

        if (senderWallet.getBalance() < amountValue) {
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
                && amountValue > senderWallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transfer exceeds your wallet per-transaction limit of $"
                            + String.format("%.2f", senderWallet.getPerTransactionLimit()));
        }

        if (senderWallet.getDailySpendingLimit() != null
                && senderWallet.getDailySpentAmount() + amountValue
                        > senderWallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transfer exceeds your wallet daily spending limit of $"
                            + String.format("%.2f", senderWallet.getDailySpendingLimit()));
        }

        Wallet recipientWallet = walletRepository.findByUserId(recipientUserId)
                .orElseGet(() -> createWallet(recipientUserId));

        senderWallet.setBalance(
            Math.round((senderWallet.getBalance() - amountValue) * 100.0) / 100.0
        );

        senderWallet.setDailySpentAmount(
            senderWallet.getDailySpentAmount() + amountValue
        );

        senderWallet.setDailySpentDate(today);
        Wallet savedSenderWallet = walletRepository.save(senderWallet);

        maybeNotifyLowBalance(senderUserId, savedSenderWallet.getBalance(), savedSenderWallet.getWalletId());

        recipientWallet.setBalance(
            Math.round((recipientWallet.getBalance() + amountValue) * 100.0) / 100.0
        );
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


        

        recordTransaction(savedRecipientWallet, WalletTransactionType.DEPOSIT, amountValue, depositCounterparty, RailType.WALLET_TRANSFER);
        WalletTransaction transferTx = recordTransaction(savedSenderWallet, WalletTransactionType.TRANSFER, amountValue ,transferCounterparty, RailType.WALLET_TRANSFER);

        NotificationCreateRequestDTO successNotification = new NotificationCreateRequestDTO();
        successNotification.setUserId(senderUserId);
        successNotification.setType(NotificationType.SUCCESS);
        successNotification.setTitle("Payment successful");
        successNotification.setDetail("$" + String.format("%.2f", amountValue) + " sent to " + transferCounterparty);
        // TODO: confirm tier for successful transfer
        successNotification.setTier(NotificationTier.T3.getValue());
        //set related entity
        NotificationEntityLinkUtil.link(successNotification, NotificationRelatedEntityType.WALLET_TRANSACTION, transferTx.getId());

        notificationService.createNotification(successNotification);

        WalletResponseDTO dto = mapToDto(savedSenderWallet);
        dto.setTransactionId(transferTx.getTransactionId());
        return dto;
    }

    private void maybeNotifyLowBalance(long userId, Double balance, Long walletId) {
        if (balance != null && balance < LOW_BALANCE_THRESHOLD
                && !notificationService.hasActiveOfType(userId, NotificationType.WARNING)) {

            NotificationCreateRequestDTO lowBalanceNotification = new NotificationCreateRequestDTO();
            lowBalanceNotification.setUserId(userId);
            lowBalanceNotification.setType(NotificationType.WARNING);
            lowBalanceNotification.setTitle("Low wallet balance");
            lowBalanceNotification.setDetail("Below $" + LOW_BALANCE_THRESHOLD.intValue());
            // TODO: Confirm tier assignment for low wallet balance notification
            lowBalanceNotification.setTier(NotificationTier.T2.getValue());
            //set related entity
            NotificationEntityLinkUtil.link(lowBalanceNotification, NotificationRelatedEntityType.WALLET, walletId);

            notificationService.createNotification(lowBalanceNotification);
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

        if (request.getDailySpendingLimit().compareTo(BigDecimal.ONE) < 0) {
            throw new InvalidWithdrawAmountException("Daily spending limit must be at least $1.00");
        }

        if (request.getDailySpendingLimit().compareTo(new BigDecimal("10000.00")) > 0) {
            throw new InvalidWithdrawAmountException(
                "Daily spending limit cannot exceed $10,000.00");
        }

        wallet.setDailySpendingLimit(request.getDailySpendingLimit().doubleValue());
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

        if (request.getPerTransactionLimit().compareTo(BigDecimal.ONE) < 0) {
            throw new WalletLimitExceededException("Per-transaction limit must be at least $1.00");
        }

        if (request.getPerTransactionLimit().compareTo(new BigDecimal("10000.00")) > 0) {
            throw new WalletLimitExceededException(
                "Per-transaction limit cannot exceed $10,000.00"
            );
        }

        wallet.setPerTransactionLimit(request.getPerTransactionLimit().doubleValue());
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
