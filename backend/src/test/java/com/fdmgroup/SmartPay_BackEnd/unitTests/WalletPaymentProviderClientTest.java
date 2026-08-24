package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.WalletPaymentProviderClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WalletPaymentProviderClientTest {
    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private WalletPaymentProviderClient paymentProviderClient;

    private Wallet senderWallet;
    private Wallet recipientWallet;
    private RecurringPayee recurringPayee;
    private LocalDate processingDate;

    @BeforeEach
    void setUp() {
        processingDate = LocalDate.of(2026, 8, 17);

        User sender = User.builder()
                .id(1L)
                .firstName("TestSender")
                .lastName("Sender")
                .build();

        User recipient = User.builder()
                .id(2L)
                .firstName("TestRecipient")
                .lastName("Recipient")
                .build();

        senderWallet = new Wallet();
        senderWallet.setUser(sender);
        senderWallet.setBalance(100.0);
        senderWallet.setDailySpentAmount(0.0);
        senderWallet.setDailySpentDate(processingDate);

        recipientWallet = new Wallet();
        recipientWallet.setUser(recipient);
        recipientWallet.setBalance(50.0);

        recurringPayee = new RecurringPayee();
        recurringPayee.setOwner(sender);
        recurringPayee.setRecipient(recipient);
        recurringPayee.setPayeeName("Netflix");
        recurringPayee.setAmount(new BigDecimal(25.0));
        recurringPayee.setType(RecurringPaymentType.BILL);
    }

    @Test
    void successfulBillChargeUpdatesBalanceAndDailySpend() {
        senderWallet.setBalance(100.0);
        senderWallet.setDailySpentAmount(20.0);
        senderWallet.setDailySpentDate(processingDate);
        recipientWallet.setBalance(50.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserId(2L))
                .thenReturn(Optional.of(recipientWallet));

        RecurringChargeRequest request = billRequest(25.0);

        ChargeExecutionResult result = paymentProviderClient.executeCharge(request);

        assertEquals(75.0, senderWallet.getBalance());
        assertEquals(45.0, senderWallet.getDailySpentAmount());
        assertEquals(processingDate, senderWallet.getDailySpentDate());
        assertEquals(75.0, recipientWallet.getBalance());
        assertEquals("RCP-charge-123", result.getWalletTransactionId());
        verify(walletRepository).save(senderWallet);
        verify(walletRepository).save(recipientWallet);
        verify(walletTransactionRepository, times(2))
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeWithExactBalanceSucceeds() {
        senderWallet.setBalance(25.0);
        senderWallet.setDailySpentAmount(0.0);
        senderWallet.setDailySpentDate(processingDate);
        recipientWallet.setBalance(50.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserId(2L))
                .thenReturn(Optional.of(recipientWallet));
        paymentProviderClient.executeCharge(billRequest(25.0));

        assertEquals(0.0, senderWallet.getBalance());
        assertEquals(25.0, senderWallet.getDailySpentAmount());
        assertEquals(processingDate, senderWallet.getDailySpentDate());
        assertEquals(75.0, recipientWallet.getBalance());
        verify(walletTransactionRepository, times(2))
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeExactlyAtDailyLimitSucceeds() {
        senderWallet.setBalance(100.0);
        senderWallet.setDailySpendingLimit(100.0);
        senderWallet.setDailySpentAmount(75.0);
        senderWallet.setDailySpentDate(processingDate);
        recipientWallet.setBalance(50.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserId(2L))
                .thenReturn(Optional.of(recipientWallet));
        paymentProviderClient.executeCharge(billRequest(25.0));

        assertEquals(75.0, senderWallet.getBalance());
        assertEquals(100.0, senderWallet.getDailySpentAmount());
        assertEquals(processingDate, senderWallet.getDailySpentDate());
        verify(walletTransactionRepository, times(2))
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeWithInsufficientFundsDoesNotMoveMoneyOrCreateTransaction() {
        senderWallet.setBalance(20.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));

        RecurringChargeRequest request = billRequest(25.0);

        assertThrows(InsufficientFundsException.class,
                () -> paymentProviderClient.executeCharge(request));
        assertEquals(20.0, senderWallet.getBalance());
        assertEquals(0.0, senderWallet.getDailySpentAmount());
        verify(walletRepository, never())
                .save(any(Wallet.class));
        verify(walletTransactionRepository, never())
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeExceedingPerTransactionLimitDoesNotMoveMoney() {
        senderWallet.setPerTransactionLimit(20.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));

        RecurringChargeRequest request = billRequest(25.0);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> paymentProviderClient.executeCharge(request));
        assertEquals(100.0, senderWallet.getBalance());
        assertEquals(0.0, senderWallet.getDailySpentAmount());
        verify(walletRepository, never())
                .save(any(Wallet.class));
        verify(walletTransactionRepository, never())
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeExceedingDailyLimitDoesNotMoveMoney() {
        senderWallet.setDailySpendingLimit(100.0);
        senderWallet.setDailySpentAmount(80.0);
        senderWallet.setDailySpentDate(processingDate);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));

        RecurringChargeRequest request = billRequest(25.0);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> paymentProviderClient.executeCharge(request));
        assertEquals(100.0, senderWallet.getBalance());
        assertEquals(80.0, senderWallet.getDailySpentAmount());
        assertEquals(processingDate, senderWallet.getDailySpentDate());
        verify(walletRepository, never())
                .save(any(Wallet.class));
        verify(walletTransactionRepository, never())
                .save(any(WalletTransaction.class));
    }

    @Test
    void billChargeResetsPreviousDaySpendUsingProcessingDate() {
        LocalDate previousDate = processingDate.minusDays(1);
        senderWallet.setBalance(100.0);
        senderWallet.setDailySpendingLimit(100.0);
        senderWallet.setDailySpentAmount(90.0);
        senderWallet.setDailySpentDate(previousDate);
        recipientWallet.setBalance(50.0);

        when(walletTransactionRepository.findByTransactionId("RCP-charge-123"))
                .thenReturn(Optional.empty());
        when(walletRepository.findByUserId(1L))
                .thenReturn(Optional.of(senderWallet));
        when(walletRepository.findByUserId(2L))
                .thenReturn(Optional.of(recipientWallet));

        RecurringChargeRequest request = billRequest(25.0);

        paymentProviderClient.executeCharge(request);

        assertEquals(75.0, senderWallet.getBalance());
        assertEquals(25.0, senderWallet.getDailySpentAmount());
        assertEquals(processingDate, senderWallet.getDailySpentDate());
        assertEquals(75.0, recipientWallet.getBalance());
    }

    private RecurringChargeRequest billRequest(double amount) {
        return RecurringChargeRequest.builder()
                .recurringPayee(recurringPayee)
                .type(RecurringPaymentType.BILL)
                .ownerUserId(1L)
                .recipientUserId(2L)
                .amount(amount)
                .providerReferenceId("charge-123")
                .processingDate(processingDate)
                .build();
    }
}
