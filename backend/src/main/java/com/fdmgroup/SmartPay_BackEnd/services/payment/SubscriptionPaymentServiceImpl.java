package com.fdmgroup.SmartPay_BackEnd.services.payment;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SubscriptionPaymentServiceImpl implements SubscriptionPaymentService{

    private final AccountRepository accountRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    public ChargeExecutionResult paySubscription(RecurringChargeRequest request) {

        final String RECURRING_TXN_PREFIX = "RCP-";

        PaymentMethod paymentMethod = request.getRecurringPayee().getPaymentMethod();
        if (paymentMethod == null || !Boolean.TRUE.equals(paymentMethod.getActive())) {
            throw new PaymentMethodNotFoundException("Payment method not found");
        }

        String providerReferenceId = request.getProviderReferenceId();
        String transactionId = RECURRING_TXN_PREFIX + providerReferenceId;

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
}
