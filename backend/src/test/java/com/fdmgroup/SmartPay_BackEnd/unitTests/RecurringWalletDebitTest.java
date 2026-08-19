package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.Utility.StringHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import com.fdmgroup.SmartPay_BackEnd.services.paymentMethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletServiceImpl;

@ExtendWith(MockitoExtension.class)
class RecurringWalletDebitTest {

    @Mock private WalletRepository walletRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private PayeeRepository payeeRepository;
    @Mock private WalletTransactionRepository walletTransactionRepository;
    @Mock private UserService userService;
    @Mock private PaymentMethodService paymentMethodService;
    @Mock private NotificationService notificationService;
    @Mock private StringHelper helper;

    @InjectMocks private WalletServiceImpl walletService;

    private Wallet wallet;

    @BeforeEach
    void setUp() {
        wallet = new Wallet();
        wallet.setUser(User.builder().id(1L).build());
        wallet.setBalance(100.0);
        wallet.setDailySpentAmount(0.0);
        when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(wallet));
    }

    @Test
    void debitsWalletAndCreatesStandardPurchaseTransaction() {
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate processingDate = LocalDate.of(2026, 8, 12);

        walletService.debitRecurringPayment(1L, 25.0, "Internet", processingDate);

        assertEquals(75.0, wallet.getBalance());
        assertEquals(25.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());
        ArgumentCaptor<WalletTransaction> transaction = ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository).save(transaction.capture());
        assertEquals(WalletTransactionType.PURCHASES, transaction.getValue().getType());
        assertEquals(RailType.DEBIT_CARD, transaction.getValue().getRailType());
        assertEquals("Internet", transaction.getValue().getCounterpartyName());
    }

    @Test
    void enforcesDailySpendingLimitWithoutCreatingARecord() {
        wallet.setDailySpendingLimit(20.0);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> walletService.debitRecurringPayment(1L, 25.0, "Internet", LocalDate.of(2026, 8, 12)));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(0.0, wallet.getDailySpentAmount());

        verify(walletRepository, never()).save(any(Wallet.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void insufficientFundsDoesNotDebitWalletOrCreateTransaction() {
        LocalDate processingDate = LocalDate.of(2026, 8, 15);

        assertThrows(InsufficientFundsException.class,
                () -> walletService.debitRecurringPayment(1L, 125.0, "Internet", processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(0.0, wallet.getDailySpentAmount());

        verify(walletRepository, never()).save(any(Wallet.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void exactBalanceMatchDebitsWallet() {
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate processingDate = LocalDate.of(2026, 8, 15);
        walletService.debitRecurringPayment(1L, 100.0, "Internet", processingDate);

        assertEquals(0.0, wallet.getBalance());
        assertEquals(100.0, wallet.getDailySpentAmount());

        verify(walletRepository).save(wallet);
        verify(walletTransactionRepository).save(any(WalletTransaction.class));
    }

    @Test
    void perTransactionLimitExceededDoesNotDebitWalletOrCreateTransaction() {
        wallet.setPerTransactionLimit(20.0);
        LocalDate processingDate = LocalDate.of(2026, 8, 15);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> walletService.debitRecurringPayment(1L, 25.0, "Internet", processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(0.0, wallet.getDailySpentAmount());

        verify(walletRepository, never()).save(any(Wallet.class));
        verify(walletTransactionRepository, never()).save(any(WalletTransaction.class));
    }

    @Test
    void exactPerTransactionLimitAllowsCharge() {
        wallet.setPerTransactionLimit(25.0);
        when(walletRepository.save(any(Wallet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        LocalDate processingDate = LocalDate.of(2026, 8, 12);
        walletService.debitRecurringPayment(1L, 25.0, "Internet", processingDate);

        assertEquals(75.0, wallet.getBalance());
        assertEquals(25.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());

        verify(walletRepository).save(wallet);
        verify(walletTransactionRepository).save(any(WalletTransaction.class));
    }

    @Test
    void exactDailySpendingLimitAllowsCharge() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(70.0);
        LocalDate processingDate = LocalDate.of(2026, 8, 15);
        wallet.setDailySpentDate(processingDate);
        when(walletRepository.save(any(Wallet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        walletService.debitRecurringPayment(1L, 30.0, "Internet", processingDate);

        assertEquals(70.0, wallet.getBalance());
        assertEquals(100.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());

        verify(walletRepository).save(wallet);
        verify(walletTransactionRepository).save(any(WalletTransaction.class));
    }

    @Test
    void previousDaySpendingIsResetBeforeSuccessfulCharge() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(90.0);
        LocalDate processingDate = LocalDate.of(2026, 8, 12);
        wallet.setDailySpentDate(processingDate.minusDays(1));
        when(walletRepository.save(any(Wallet.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        walletService.debitRecurringPayment(1L, 30.0, "Internet", processingDate);

        assertEquals(70.0, wallet.getBalance());
        assertEquals(30.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());

        verify(walletRepository).save(wallet);
        verify(walletTransactionRepository).save(any(WalletTransaction.class));
    }
}
