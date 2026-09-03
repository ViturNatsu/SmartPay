package com.fdmgroup.SmartPay_BackEnd.services.payment;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;


@Service
@RequiredArgsConstructor
public class BillPaymentServiceImpl implements BillPaymentService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Override
    @Transactional
    public ChargeExecutionResult payBill(RecurringChargeRequest requestContext) {

        // This whole process was copied from an old workflow.
        // I suggest making a proper walletTransactionService that defines exactly how a transfer is done, then call it here.

        final String RECURRING_TXN_PREFIX = "RCP-";

        Wallet senderWallet = walletRepository.findByUserId(requestContext.getOwnerUserId())
                .orElseThrow(()-> new IllegalStateException("Sender wallet not found"));

        Wallet recipientWallet = walletRepository.findByUserId(requestContext.getRecipientUserId())
                .orElseThrow(()-> new IllegalStateException("Recipient wallet not found"));

        double amount = requestContext.getAmount();
        LocalDate processingDate = requestContext.getProcessingDate();

        String providerReferenceId = requestContext.getProviderReferenceId();
        String transactionId = RECURRING_TXN_PREFIX + providerReferenceId;

        senderWallet.setBalance(Math.round((senderWallet.getBalance() - amount ) * 100.0 ) / 100.0 );
        senderWallet.setDailySpentAmount(senderWallet.getDailySpentAmount() + amount);
        senderWallet.setDailySpentDate(processingDate);
        walletRepository.save(senderWallet);

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0 ) / 100.0 );
        walletRepository.save(recipientWallet);

        WalletTransaction transferTx = new WalletTransaction();
        transferTx.setTransactionId(transactionId);
        transferTx.setWallet(senderWallet);
        transferTx.setType(WalletTransactionType.TRANSFER);
        transferTx.setAmount(amount);
        transferTx.setCounterpartyName(requestContext.getRecurringPayee().getPayeeName());
        transferTx.setRailType(RailType.WALLET_TRANSFER);
        transferTx.setStatus("COMPLETED");
        transferTx.setCreatedAt(Instant.now());

        walletTransactionRepository.save(transferTx);

        WalletTransaction depositTx = new WalletTransaction();
        depositTx.setTransactionId("RCP-DEP-" + providerReferenceId);
        depositTx.setWallet(recipientWallet);
        depositTx.setType(WalletTransactionType.DEPOSIT);
        depositTx.setAmount(amount);
        depositTx.setCounterpartyName(
                senderWallet.getUser() == null
                    ? "Smartpay user"
                    : senderWallet.getUser().getFirstName() + " "
                    + senderWallet.getUser().getLastName()
        );
        depositTx.setRailType(RailType.WALLET_TRANSFER);
        depositTx.setStatus("COMPLETED");
        depositTx.setCreatedAt(Instant.now());
        walletTransactionRepository.save(depositTx);

        return new ChargeExecutionResult(providerReferenceId, transactionId);
    }
}
