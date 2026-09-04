package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.Utility.StringHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import com.fdmgroup.SmartPay_BackEnd.services.paymentMethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletServiceImpl;

@ExtendWith(MockitoExtension.class)
class WalletTransferServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PayeeRepository payeeRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    @Mock
    private UserService userService;

    @Mock
    private PaymentMethodService paymentMethodService;

    @Mock
    private StringHelper helper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private WalletServiceImpl walletService;

    private Wallet senderWallet;
    private Wallet recipientWallet;

    @BeforeEach
    void setUp() {
        User sender = User.builder().id(1L).email("sender@smartpay.com").build();
        User recipient = User.builder().id(2L).email("recipient@smartpay.com").build();

        senderWallet = new Wallet();
        senderWallet.setWalletId(1L);
        senderWallet.setBalance(200.00);
        senderWallet.setUser(sender);

        recipientWallet = new Wallet();
        recipientWallet.setWalletId(2L);
        recipientWallet.setBalance(50.00);
        recipientWallet.setUser(recipient);

        lenient().when(walletRepository.findByUserId(1L)).thenReturn(Optional.of(senderWallet));
        lenient().when(walletRepository.findByUserId(2L)).thenReturn(Optional.of(recipientWallet));
        lenient().when(walletRepository.save(any(Wallet.class))).thenAnswer(inv -> inv.getArgument(0));

        WalletTransaction stubTx = new WalletTransaction();
        stubTx.setId(123L);
        stubTx.setTransactionId("TXN-test1234");
        lenient().when(walletTransactionRepository.save(any(WalletTransaction.class))).thenReturn(stubTx);
        lenient().when(payeeRepository.findByOwnerIdAndRecipientId(anyLong(), anyLong()))
                .thenReturn(Optional.empty());
        lenient().when(helper.fullName(any(User.class)))
                .thenAnswer(inv -> {
                    User u = inv.getArgument(0);
                    return u.getFirstName() + " " + u.getLastName();
                });
    }

    @Test
    void transfer_debitsSourceAndCreditsRecipient_whenBalanceSufficient() {
        walletService.transfer(1L, 2L, new BigDecimal("75.00"), "Dinner split");

        assertEquals(125.00, senderWallet.getBalance());
        assertEquals(125.00, recipientWallet.getBalance());
    }

    @Test
    void transfer_savesBothWallets_whenTransferSucceeds() {
        walletService.transfer(1L, 2L, new BigDecimal("75.00"), "Dinner split");

        verify(walletRepository, times(2)).save(any(Wallet.class));
    }

    @Test
    void transfer_throwsInsufficientFunds_whenBalanceTooLow() {
        assertThrows(InsufficientFundsException.class,
                () -> walletService.transfer(1L, 2L, new BigDecimal("250.00"), null));
    }

    @Test
    void transfer_throwsInsufficientFunds_withoutSavingAnything_whenBalanceTooLow() {
        assertThrows(InsufficientFundsException.class,
                () -> walletService.transfer(1L, 2L, new BigDecimal("250.00"), null));

        verify(walletRepository, never()).save(any(Wallet.class));
    }

    @Test
    void transfer_succeedsWhenAmountEqualsExactBalance() {
        walletService.transfer(1L, 2L, new BigDecimal("200.00"), null);

        assertEquals(0.00, senderWallet.getBalance());
        assertEquals(250.00, recipientWallet.getBalance());
    }

    @Test
    void transfer_roundsToTwoDecimalPlaces() {
        senderWallet.setBalance(100.00);
        recipientWallet.setBalance(0.00);

        walletService.transfer(1L, 2L, new BigDecimal("33.33"), null);

        assertEquals(66.67, senderWallet.getBalance());
        assertEquals(33.33, recipientWallet.getBalance());
    }

    @Test
    void transfer_worksWithNullMemo() {
        assertDoesNotThrow(() -> walletService.transfer(1L, 2L, new BigDecimal("10.00"), null));
    }

    @Test
    void transfer_recordsWalletTransferRailForSenderAndRecipientTransactions() {
        walletService.transfer(1L, 2L, new BigDecimal("75.00"), "Dinner split");

        ArgumentCaptor<WalletTransaction> transactionCaptor =
                ArgumentCaptor.forClass(WalletTransaction.class);
        verify(walletTransactionRepository, times(2)).save(transactionCaptor.capture());

        assertTrue(transactionCaptor.getAllValues().stream()
                .allMatch(tx -> tx.getRailType() == RailType.WALLET_TRANSFER));
    }

    @Test
    void transfer_createsSuccessNotification_whenTransferSucceeds() {
        walletService.transfer(1L, 2L, new BigDecimal("75.00"), "Dinner split");

        // Scenario 6 — outbound send now routes through the shared event service (T3).
        verify(notificationService, times(1))
                .createFromEventSafely(
                        eq(NotificationEventType.OUTBOUND_P2P_SEND_SUCCESS),
                        eq(1L),
                        eq(123L),
                        any(NotificationEventContext.class));
    }

    @Test
    void transfer_createsReceivedNotification_forRecipient_whenTransferSucceeds() {
        walletService.transfer(1L, 2L, new BigDecimal("75.00"), "Dinner split");

        // Scenario 7 — inbound received routes through the shared event service (T4).
        verify(notificationService, times(1))
                .createFromEventSafely(
                        eq(NotificationEventType.INBOUND_P2P_RECEIVED),
                        eq(2L),
                        eq(123L),
                        any(NotificationEventContext.class));
    }

    @Test
    void transfer_createsFailedNotification_linkedToTransaction_whenBalanceTooLow() {
        // Scenario 5 — the failed outcome is recorded as a transaction and the T2 notification links to it.
        assertThrows(InsufficientFundsException.class,
                () -> walletService.transfer(1L, 2L, new BigDecimal("250.00"), null));

        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.P2P_TRANSFER_FAILED), eq(1L), eq(123L),
                any(NotificationEventContext.class));
    }

    @Test
    void loadFunds_createsLoadSuccessNotification_whenLoadSucceeds() {
        PaymentMethod pm = mock(PaymentMethod.class);
        Account account = mock(Account.class);
        when(pm.getActive()).thenReturn(true);
        when(pm.getAccount()).thenReturn(account);
        when(account.getBalance()).thenReturn(1000.0);
        when(paymentRepository.findByPaymentMethodIdAndUser_Id(50L, 1L)).thenReturn(Optional.of(pm));

        LoadWalletRequestDTO request = mock(LoadWalletRequestDTO.class);
        when(request.getPaymentMethodId()).thenReturn(50L);
        when(request.getAmount()).thenReturn(100.0);

        walletService.loadFunds(1L, request);

        // Scenario 7 — inbound wallet load confirmation (T4).
        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.WALLET_LOAD_SUCCESS), eq(1L), eq(123L),
                any(NotificationEventContext.class));
    }

    @Test
    void loadFunds_createsLoadFailedNotification_linkedToTransaction_whenBankBalanceInsufficient() {
        PaymentMethod pm = mock(PaymentMethod.class);
        Account account = mock(Account.class);
        when(pm.getActive()).thenReturn(true);
        when(pm.getAccount()).thenReturn(account);
        when(account.getBalance()).thenReturn(10.0);
        when(paymentRepository.findByPaymentMethodIdAndUser_Id(50L, 1L)).thenReturn(Optional.of(pm));

        LoadWalletRequestDTO request = mock(LoadWalletRequestDTO.class);
        when(request.getPaymentMethodId()).thenReturn(50L);
        when(request.getAmount()).thenReturn(100.0);

        assertThrows(InsufficientFundsException.class, () -> walletService.loadFunds(1L, request));

        // Scenario 5 — failed wallet load (T2), linked to the recorded FAILED transaction.
        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.WALLET_LOAD_FAILED), eq(1L), eq(123L),
                any(NotificationEventContext.class));
    }

    @Test
    void withdrawFunds_createsWithdrawalSuccessNotification_whenWithdrawSucceeds() {
        senderWallet.setBalance(5000.0);
        PaymentMethod pm = mock(PaymentMethod.class);
        when(pm.getUser()).thenReturn(User.builder().id(1L).build());
        when(pm.getActive()).thenReturn(true);
        when(paymentMethodService.findPaymentMethodById(50L)).thenReturn(pm);

        WithdrawRequestDTO request = mock(WithdrawRequestDTO.class);
        when(request.getAmount()).thenReturn(new BigDecimal("100.00"));
        when(request.getPaymentMethodId()).thenReturn(50L);

        walletService.withdrawFunds(1L, request);

        // Scenario 6 — outbound withdrawal confirmation (T3).
        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.WALLET_WITHDRAWAL_SUCCESS), eq(1L), eq(123L),
                any(NotificationEventContext.class));
    }

    @Test
    void transfer_createsLowBalanceWarning_whenResultingBalanceBelowThreshold() {
        senderWallet.setBalance(300.00);

        walletService.transfer(1L, 2L, new BigDecimal("100.00"), null);

        verify(notificationService, times(1))
                .createNotification(argThat(request ->
                        request != null
                                && request.getUserId().equals(1L)
                                && request.getType() == NotificationType.WARNING
                                && request.getTitle().equals("Low wallet balance")
                                && "WALLET".equals(request.getRelatedEntityType())
                                && "1".equals(request.getRelatedEntityId())

                ));
    }

    @Test
    void transfer_doesNotDuplicateLowBalanceWarning_whenActiveWarningAlreadyExists() {
        senderWallet.setBalance(300.00);
        when(notificationService.hasActiveOfType(1L, NotificationType.WARNING)).thenReturn(true);

        walletService.transfer(1L, 2L, new BigDecimal("100.00"), null);

        verify(notificationService, never())
                .createNotification(argThat(request ->
                        request != null
                                && request.getUserId().equals(1L)
                                && request.getType() == NotificationType.WARNING
                                && request.getTitle().equals("Low wallet balance")
                ));
    }
}
                            