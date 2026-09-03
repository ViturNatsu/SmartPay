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
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.PayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentMethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
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

        verify(notificationService, times(1))
                .createNotification(argThat(request ->
                        request != null
                                && request.getUserId().equals(1L)
                                && request.getType() == NotificationType.SUCCESS
                                && request.getTier().equals(3)
                                && request.getTitle().equals("Payment successful")
                                && "WALLET_TRANSACTION".equals(request.getRelatedEntityType())
                                && "123".equals(request.getRelatedEntityId())
                ));
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
                            