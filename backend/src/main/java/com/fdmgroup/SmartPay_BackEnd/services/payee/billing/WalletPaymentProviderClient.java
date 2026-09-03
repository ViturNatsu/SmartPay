package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringChargeValidationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WalletPaymentProviderClient implements PaymentProviderClient {

    static final String RECURRING_TXN_PREFIX = "RCP-";

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AccountRepository accountRepository;
    private final RecurringChargeValidationUtil recurringChargeValidationUtil;

    @Override
    @Transactional
    public ChargeExecutionResult executeCharge(RecurringChargeRequest request) {
        String providerReferenceId = request.getProviderReferenceId();
        String transactionId = toTransactionId(providerReferenceId);

        Optional<WalletTransaction> existing = walletTransactionRepository.findByTransactionId(transactionId);
        if (existing.isPresent()) {
            return new ChargeExecutionResult(providerReferenceId, existing.get().getTransactionId());
        }

        if (request.getType() == RecurringPaymentType.BILL) {
            return executeBillCharge(request, transactionId, providerReferenceId);
        }

        return executeSubscriptionCharge(request, transactionId, providerReferenceId);
    }

    @Override
    public boolean confirmChargeSucceeded(String providerReferenceId) {
        if (providerReferenceId == null || providerReferenceId.isBlank()) {
            return false;
        }
        return walletTransactionRepository.findByTransactionId(toTransactionId(providerReferenceId)).isPresent();
    }

    private ChargeExecutionResult executeBillCharge(
            RecurringChargeRequest request,
            String transactionId,
            String providerReferenceId) {
        Wallet senderWallet = walletRepository.findByUserId(request.getOwnerUserId())
                .orElseThrow(() -> new IllegalStateException("Sender wallet not found"));
        double amount = request.getAmount();
//        if (senderWallet.getBalance() == null || senderWallet.getBalance() < amount) {
//            throw new InsufficientFundsException("Insufficient wallet balance for recurring bill payment");
//        }
        LocalDate processingDate = request.getProcessingDate();

        recurringChargeValidationUtil.validate(senderWallet, amount, processingDate);
        resetDailySpendIfNeeded(senderWallet, processingDate);

        Wallet recipientWallet = walletRepository.findByUserId(request.getRecipientUserId())
                .orElseThrow(() -> new IllegalStateException("Recipient wallet not found"));

        senderWallet.setBalance(Math.round((senderWallet.getBalance() - amount) * 100.0) / 100.0);
        senderWallet.setDailySpentAmount(senderWallet.getDailySpentAmount() + amount);
        senderWallet.setDailySpentDate(processingDate);
        walletRepository.save(senderWallet);

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0) / 100.0);
        walletRepository.save(recipientWallet);

        WalletTransaction transferTx = new WalletTransaction();
        transferTx.setTransactionId(transactionId);
        transferTx.setWallet(senderWallet);
        transferTx.setType(WalletTransactionType.TRANSFER);
        transferTx.setAmount(amount);
        transferTx.setCounterpartyName(request.getRecurringPayee().getPayeeName());
        transferTx.setRailType(RailType.WALLET_TRANSFER);
        transferTx.setStatus("COMPLETED");
        transferTx.setCreatedAt(Instant.now());
        walletTransactionRepository.save(transferTx);

        WalletTransaction depositTx = new WalletTransaction();
        depositTx.setTransactionId("RCP-DEP-" + providerReferenceId);
        depositTx.setWallet(recipientWallet);
        depositTx.setType(WalletTransactionType.DEPOSIT);
        depositTx.setAmount(amount);
        depositTx.setCounterpartyName(resolveSenderName(senderWallet.getUser()));
        depositTx.setRailType(RailType.WALLET_TRANSFER);
        depositTx.setStatus("COMPLETED");
        depositTx.setCreatedAt(Instant.now());
        walletTransactionRepository.save(depositTx);

        return new ChargeExecutionResult(providerReferenceId, transactionId);
    }

    private ChargeExecutionResult executeSubscriptionCharge(
            RecurringChargeRequest request,
            String transactionId,
            String providerReferenceId) {
        PaymentMethod paymentMethod = request.getRecurringPayee().getPaymentMethod();
        if (paymentMethod == null || !Boolean.TRUE.equals(paymentMethod.getActive())) {
            throw new PaymentMethodNotFoundException("Payment method not found");
        }

        Account account = paymentMethod.getAccount();
        double amount = request.getAmount();
        double accountBalance = account.getBalance() != null ? account.getBalance() : 0.0;
        if (accountBalance < amount) {
            throw new InsufficientFundsException("Insufficient funds in linked account for subscription payment");
        }

        account.setBalance(accountBalance - amount);
        accountRepository.save(account);

        Wallet merchantWallet = walletRepository.findByUserId(request.getRecipientUserId())
                .orElseThrow(() -> new IllegalStateException("Merchant wallet not found"));
        double merchantBalance = merchantWallet.getBalance() != null ? merchantWallet.getBalance() : 0.0;
        merchantWallet.setBalance(Math.round((merchantBalance + amount) * 100.0) / 100.0);
        walletRepository.save(merchantWallet);

        Wallet ownerWallet = walletRepository.findByUserId(request.getOwnerUserId())
                .orElseThrow(() -> new IllegalStateException("Owner wallet not found"));

        WalletTransaction purchaseTx = new WalletTransaction();
        purchaseTx.setTransactionId(transactionId);
        purchaseTx.setWallet(ownerWallet);
        purchaseTx.setType(WalletTransactionType.PURCHASES);
        purchaseTx.setAmount(amount);
        purchaseTx.setPaymentMethodId(paymentMethod.getPaymentMethodId());
        purchaseTx.setBankDisplayName(paymentMethod.getBankDisplayName());
        purchaseTx.setCounterpartyName(request.getRecurringPayee().getPayeeName());
        purchaseTx.setRailType(RailType.BANK_TRANSFER);
        purchaseTx.setStatus("COMPLETED");
        purchaseTx.setCreatedAt(Instant.now());
        walletTransactionRepository.save(purchaseTx);

        return new ChargeExecutionResult(providerReferenceId, transactionId);
    }

    private String resolveSenderName(User sender) {
        if (sender == null) {
            return "SmartPay user";
        }
        return sender.getFirstName() + " " + sender.getLastName();
    }

    public static String toTransactionId(String providerReferenceId) {
        return RECURRING_TXN_PREFIX + providerReferenceId;
    }

    private void resetDailySpendIfNeeded(Wallet wallet, LocalDate processingDate) {
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(processingDate)) {
            wallet.setDailySpentAmount(0.0);
            wallet.setDailySpentDate(processingDate);
        }
    }
}
