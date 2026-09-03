package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fdmgroup.SmartPay_BackEnd.Utility.*;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransactionType;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.RegistrationHelper;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.IntegrationTestHelper;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringBillingChargeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringBillingService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

@SpringBootTest(classes = SmartPayBackEndApplication.class)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class RecurringBillingLimitIntegrationTest {
    @Autowired
    private RecurringBillingService recurringBillingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CardRepository cardRepository;

    @MockitoSpyBean
    private RecurringPayeeRepository recurringPayeeRepository;

    @Autowired
    private RecurringBillingChargeRepository chargeRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private IntegrationTestHelper helper;

    @Autowired
    private GenerateStringsHelper generateStringsHelper;

    private LocalDate processingDate;
    private User sender;
    private User recipient;
    private Wallet senderWallet;
    private Wallet recipientWallet;
    private RecurringPayee recurringPayee;

    @BeforeEach
    void setUp() {
        helper.clearDB();

        processingDate = LocalDate.of(2026, 8, 18);

        sender = User.builder()
                .firstName("TestSender")
                .lastName("Sender")
                .email("sender@test.com")
                .role(Role.USER)
                .failedLoginAttempts(0)
                .build();

        recipient = User.builder()
                .firstName("TestRecipient")
                .lastName("Recipient")
                .email("recipient@test.com")
                .role(Role.USER)
                .failedLoginAttempts(0)
                .build();

        sender = userRepository.save(sender);
        recipient = userRepository.save(recipient);

        senderWallet = new Wallet();
        senderWallet.setUser(sender);
        senderWallet.setBalance(100.0);
        senderWallet.setPerTransactionLimit(50.0);
        senderWallet.setDailySpendingLimit(100.0);
        senderWallet.setDailySpentAmount(20.0);
        senderWallet.setDailySpentDate(processingDate);

        recipientWallet = new Wallet();
        recipientWallet.setUser(recipient);
        recipientWallet.setBalance(50.0);
        recipientWallet.setDailySpentAmount(0.0);

        senderWallet = walletRepository.save(senderWallet);
        recipientWallet = walletRepository.save(recipientWallet);

        recurringPayee = new RecurringPayee();
        recurringPayee.setOwner(sender);
        recurringPayee.setRecipient(recipient);
        recurringPayee.setPayeeName("Telus");
        recurringPayee.setActive(true);

        recurringPayee.setType(RecurringPaymentType.BILL);
        recurringPayee.setAccountNumber("BILL-123");
        recurringPayee.setAmount(new BigDecimal(25.0));
        recurringPayee.setSchedule(Schedule.MONTHLY);
        recurringPayee.setDate(processingDate);
        recurringPayee.setStatus(RecurringPaymentStatus.ACTIVE);

        recurringPayee = recurringPayeeRepository.save(recurringPayee);

        Card senderCard = new Card();
        senderCard.setCardNumber(generateStringsHelper.generateCardNumber());
        senderCard.setCvv("123");
        senderCard.setExpirationDate(LocalDateTime.now().plusYears(2));
        senderCard.setStatus(CardStatus.ACTIVE);
        senderCard.setWallet(senderWallet);
        cardRepository.save(senderCard);

    }

    @Test
    void successfulRecurringBillUpdatesWalletsAndCompletesCharge() {
        recurringBillingService.processDuePaymentsForDate(processingDate);

        Wallet updatedSenderWallet = walletRepository.findByUserId(sender.getId()).orElseThrow();
        Wallet updatedRecipientWallet = walletRepository.findByUserId(recipient.getId()).orElseThrow();
        RecurringPayee updatedPayee = recurringPayeeRepository.findById(recurringPayee.getPayeeId()).orElseThrow();
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(recurringPayee.getPayeeId(), processingDate);
        RecurringBillingCharge charge = chargeRepository.findByIdempotencyKey(idempotencyKey).orElseThrow();
        List<WalletTransaction> senderTransactions = walletTransactionRepository.findByWalletId(updatedSenderWallet.getWalletId());
        List<WalletTransaction> recipientTransactions = walletTransactionRepository.findByWalletId(updatedRecipientWallet.getWalletId());

        // Sender
        assertEquals(75.0, updatedSenderWallet.getBalance());
        assertEquals(45.0, updatedSenderWallet.getDailySpentAmount());
        assertEquals(processingDate, updatedSenderWallet.getDailySpentDate());

        // Recipient
        assertEquals(75.0, updatedRecipientWallet.getBalance());

        // Billing attempt completed
        assertEquals(RecurringBillingStatus.COMPLETED, charge.getStatus());

        // Successful processing advances next payment date
        assertEquals(processingDate.plusMonths(1), updatedPayee.getDate());

        // Sender TRANSFER transaction + recipient DEPOSIT transaction
        assertEquals(1, senderTransactions.size());
        assertEquals(WalletTransactionType.TRANSFER, senderTransactions.get(0).getType());
        assertEquals(1, recipientTransactions.size());
        assertEquals(WalletTransactionType.DEPOSIT, recipientTransactions.get(0).getType());
    }

    @Test
    void recurringBillWithInsufficientBalanceFailsWithoutChangingWallets() {
        senderWallet.setBalance(20.0);
        walletRepository.save(senderWallet);
        double originalSenderBalance = senderWallet.getBalance();
        double originalDailySpent = senderWallet.getDailySpentAmount();
        double originalRecipientBalance = recipientWallet.getBalance();

        recurringBillingService.processDuePaymentsForDate(processingDate);

        // Re-fetch actual DB state
        Wallet updatedSenderWallet = walletRepository.findByUserId(sender.getId()).orElseThrow();
        Wallet updatedRecipientWallet = walletRepository.findByUserId(recipient.getId()).orElseThrow();
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(recurringPayee.getPayeeId(), processingDate);
        RecurringBillingCharge charge = chargeRepository.findByIdempotencyKey(idempotencyKey).orElseThrow();
        RecurringPayee updatedPayee = recurringPayeeRepository.findById(recurringPayee.getPayeeId()).orElseThrow();
        List<WalletTransaction> senderTransactions = walletTransactionRepository.findByWalletId(updatedSenderWallet.getWalletId());
        List<WalletTransaction> recipientTransactions = walletTransactionRepository.findByWalletId(updatedRecipientWallet.getWalletId());

        // Sender unchanged
        assertEquals(originalSenderBalance, updatedSenderWallet.getBalance());
        assertEquals(originalDailySpent, updatedSenderWallet.getDailySpentAmount());
        assertEquals(processingDate, updatedSenderWallet.getDailySpentDate());

        // Recipient unchanged
        assertEquals(originalRecipientBalance, updatedRecipientWallet.getBalance());

        // Attempt persisted as FAILED
        assertEquals(RecurringBillingStatus.FAILED, charge.getStatus());

        // Failed payment does not advance schedule
        assertEquals(processingDate, updatedPayee.getDate());

        // No debit/deposit records
        assertTrue(senderTransactions.isEmpty());
        assertTrue(recipientTransactions.isEmpty());
    }

    @Test
    void recurringBillExceedingPerTransactionLimitFailsWithoutChangingWallets() {
        senderWallet.setPerTransactionLimit(20.0);
        walletRepository.save(senderWallet);
        double originalSenderBalance = senderWallet.getBalance();
        double originalDailySpent = senderWallet.getDailySpentAmount();
        double originalRecipientBalance = recipientWallet.getBalance();

        recurringBillingService.processDuePaymentsForDate(processingDate);

        // Re-fetch database state
        Wallet updatedSenderWallet = walletRepository.findByUserId(sender.getId()).orElseThrow();
        Wallet updatedRecipientWallet = walletRepository.findByUserId(recipient.getId()).orElseThrow();
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(recurringPayee.getPayeeId(), processingDate);
        RecurringBillingCharge charge = chargeRepository.findByIdempotencyKey(idempotencyKey).orElseThrow();
        RecurringPayee updatedPayee = recurringPayeeRepository.findById(recurringPayee.getPayeeId()).orElseThrow();
        List<WalletTransaction> senderTransactions = walletTransactionRepository.findByWalletId(updatedSenderWallet.getWalletId());
        List<WalletTransaction> recipientTransactions = walletTransactionRepository.findByWalletId(updatedRecipientWallet.getWalletId());

        // Wallet state unchanged
        assertEquals(originalSenderBalance, updatedSenderWallet.getBalance());
        assertEquals(originalDailySpent, updatedSenderWallet.getDailySpentAmount());
        assertEquals(processingDate, updatedSenderWallet.getDailySpentDate());
        assertEquals(originalRecipientBalance, updatedRecipientWallet.getBalance());

        // Billing attempt recorded as FAILED
        assertEquals(RecurringBillingStatus.FAILED, charge.getStatus());

        // Failed payment does not advance schedule
        assertEquals(processingDate, updatedPayee.getDate());

        // No debit / deposit records created
        assertTrue(senderTransactions.isEmpty());
        assertTrue(recipientTransactions.isEmpty());
    }

    @Test
    void recurringBillExceedingDailyLimitFailsWithoutChangingWallets() {
        senderWallet.setDailySpentAmount(80.0);
        senderWallet.setDailySpentDate(processingDate);
        walletRepository.save(senderWallet);
        double originalSenderBalance = senderWallet.getBalance();
        double originalDailySpent = senderWallet.getDailySpentAmount();
        double originalRecipientBalance = recipientWallet.getBalance();

        recurringBillingService.processDuePaymentsForDate(processingDate);

        // Re-fetch database state
        Wallet updatedSenderWallet = walletRepository.findByUserId(sender.getId()).orElseThrow();
        Wallet updatedRecipientWallet = walletRepository.findByUserId(recipient.getId()).orElseThrow();
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(recurringPayee.getPayeeId(), processingDate);
        RecurringBillingCharge charge = chargeRepository.findByIdempotencyKey(idempotencyKey).orElseThrow();
        RecurringPayee updatedPayee = recurringPayeeRepository.findById(recurringPayee.getPayeeId()).orElseThrow();
        List<WalletTransaction> senderTransactions = walletTransactionRepository.findByWalletId(updatedSenderWallet.getWalletId());
        List<WalletTransaction> recipientTransactions = walletTransactionRepository.findByWalletId(updatedRecipientWallet.getWalletId());

        // Sender unchanged
        assertEquals(originalSenderBalance, updatedSenderWallet.getBalance());
        assertEquals(originalDailySpent, updatedSenderWallet.getDailySpentAmount());
        assertEquals(processingDate, updatedSenderWallet.getDailySpentDate());

        // Recipient unchanged
        assertEquals(originalRecipientBalance, updatedRecipientWallet.getBalance());

        // Billing attempt is FAILED
        assertEquals(RecurringBillingStatus.FAILED, charge.getStatus());

        // Failed payment does not advance schedule
        assertEquals(processingDate, updatedPayee.getDate());

        // No wallet transaction/deposit records
        assertTrue(senderTransactions.isEmpty());
        assertTrue(recipientTransactions.isEmpty());
    }

    @Test
    void technicalFailureAfterWalletUpdatesRollsBackEntireCharge() {
        double originalSenderBalance = senderWallet.getBalance();
        double originalDailySpent = senderWallet.getDailySpentAmount();
        double originalRecipientBalance = recipientWallet.getBalance();
        LocalDate originalPayeeDate = recurringPayee.getDate();

        // Allow the normal charge to proceed all the way until the next scheduled payment is being saved.
        doThrow(new IllegalStateException("Simulated failure while updating next scheduled payment"))
                .when(recurringPayeeRepository)
                .save(argThat(payee -> payee.getPayeeId() == recurringPayee.getPayeeId()));

        recurringBillingService.processDuePaymentsForDate(processingDate);

        Wallet updatedSender = walletRepository.findByUserId(sender.getId()).orElseThrow();
        Wallet updatedRecipient = walletRepository.findByUserId(recipient.getId()).orElseThrow();
        RecurringPayee updatedPayee = recurringPayeeRepository.findById(recurringPayee.getPayeeId()).orElseThrow();
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(recurringPayee.getPayeeId(), processingDate);
        RecurringBillingCharge charge = chargeRepository.findByIdempotencyKey(idempotencyKey).orElseThrow();
        List<WalletTransaction> senderTransactions = walletTransactionRepository.findByWalletId(updatedSender.getWalletId());
        List<WalletTransaction> recipientTransactions = walletTransactionRepository.findByWalletId(updatedRecipient.getWalletId());

        // Sender unchanged
        assertEquals(originalSenderBalance, updatedSender.getBalance());
        assertEquals(originalDailySpent, updatedSender.getDailySpentAmount());

        // Recipient unchanged
        assertEquals(originalRecipientBalance, updatedRecipient.getBalance());

        // No wallet transaction/deposit records
        assertTrue(senderTransactions.isEmpty());
        assertTrue(recipientTransactions.isEmpty());

        // Billing attempt is still IN_PROGRESS
        assertEquals(RecurringBillingStatus.IN_PROGRESS, charge.getStatus());

        // does not advance schedule
        assertEquals(originalPayeeDate, updatedPayee.getDate());
    }
}
