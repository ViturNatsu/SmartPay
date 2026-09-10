package com.fdmgroup.SmartPay_BackEnd.services.payment;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SubscriptionPaymentServiceImpl implements SubscriptionPaymentService{

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    public ChargeExecutionResult paySubscription(RecurringChargeRequest requestContext) {

        final String RECURRING_TXN_PREFIX = "RCP-";

        String providerReferenceId = requestContext.getProviderReferenceId();
        String transactionId = RECURRING_TXN_PREFIX + providerReferenceId;

        double amount = requestContext.getAmount();
        LocalDate processingDate = requestContext.getProcessingDate();
        
        Wallet ownerWallet = walletRepository.findByUserId(requestContext.getOwnerUserId())
                .orElseThrow(() -> new IllegalStateException("Owner wallet not found"));

        Wallet merchantWallet = walletRepository.findByUserId(requestContext.getRecipientUserId())
                .orElseThrow(() -> new IllegalStateException("Merchant wallet not found"));
        double merchantBalance = merchantWallet.getBalance() != null ? merchantWallet.getBalance() : 0.0;
        double ownerBalance = ownerWallet.getBalance() != null ? ownerWallet.getBalance() : 0.0;

        if(ownerBalance < amount){
            throw new IllegalStateException("Insufficient balance in owner wallet");
        }
        
        ownerWallet.setBalance(Math.round((ownerBalance - amount ) * 100.0 ) / 100.0 );
        ownerWallet.setDailySpentAmount(ownerWallet.getDailySpentAmount() + amount);
        ownerWallet.setDailySpentDate(processingDate);
        walletRepository.save(ownerWallet);

        merchantWallet.setBalance(Math.round((merchantBalance + amount) * 100.0) / 100.0);
        walletRepository.save(merchantWallet);

        WalletTransaction purchaseTx = new WalletTransaction();
        purchaseTx.setTransactionId(transactionId);
        purchaseTx.setWallet(ownerWallet);
        purchaseTx.setType(WalletTransactionType.PURCHASES);
        purchaseTx.setAmount(amount);
        purchaseTx.setCounterpartyName(requestContext.getRecurringPayee().getPayeeName());
        purchaseTx.setRailType(RailType.WALLET_TRANSFER);
        purchaseTx.setStatus("COMPLETED");
        purchaseTx.setCreatedAt(Instant.now());
        walletTransactionRepository.save(purchaseTx);

        return new ChargeExecutionResult(providerReferenceId, transactionId);
    }
}
