package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringChargeValidationUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.card.IllegalCardChargeException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class RecurringChargeValidationUtilTest {
    private Wallet wallet;
    private LocalDate processingDate;

    @Mock
    private CardRequestService cardRequestService;

    @InjectMocks
    private RecurringChargeValidationUtil recurringChargeValidationUtil;

    @BeforeEach
    void setUp() {
        processingDate = LocalDate.of(2026, 8, 15);

        wallet = new Wallet();
        wallet.setBalance(100.0);
        wallet.setDailySpentAmount(0.0);
        wallet.setDailySpentDate(processingDate);

        Card card = new Card();
        card.setStatus(CardStatus.ACTIVE);
        wallet.setCard(card);
    }

    //AC6
    @Test
    void acceptsChargeWhenFundsAreSufficient() {
        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                wallet, 50.0, processingDate));
    }

    //AC1, AC2
    @Test
    void rejectsChargeWhenFundsAreInsufficient() {
        assertThrows(InsufficientFundsException.class,
                () -> recurringChargeValidationUtil.validate(
                        wallet, 150.0, processingDate));
    }

    @Test
    void acceptsChargeWhenBalanceExactlyMatchesAmount() {
        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                        wallet, 100.0, processingDate));
    }

    //AC7
    @Test
    void acceptsChargeWhenWithinPerTransactionLimit() {
        wallet.setPerTransactionLimit(80.0);
        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                        wallet, 50.0, processingDate));
    }

    //AC8
    @Test
    void rejectsChargeWhenPerTransactionLimitExceeds() {
        wallet.setPerTransactionLimit(80.0);
        assertThrows(InvalidWithdrawAmountException.class,
                () -> recurringChargeValidationUtil.validate(
                wallet, 90.0, processingDate));
    }

    //AC12
    @Test
    void acceptsChargeWhenAmountMatchesPerTransactionLimit() {
        wallet.setPerTransactionLimit(80.0);

//        when(RecurringChargeValidationUtil.).

        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                wallet, 80.0, processingDate));
    }

    @Test
    void acceptsChargeWhenWithinDailySpendingLimit() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(40.0);
        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));
    }

    @Test
    void acceptsChargeWhenDailySpendingLimitExceeds() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(80.0);
        assertThrows(InvalidWithdrawAmountException.class,
                () -> recurringChargeValidationUtil.validate(
                        wallet, 100.0, processingDate));
    }

    @Test
    void acceptsChargeWhenAmountsMatchesDailySpendingLimit() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(70.0);
        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                wallet, 30.0, processingDate));
    }

    @Test
    void ignoresDailySpendFromPreviousDate() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(90.0);
        wallet.setDailySpentDate(processingDate.minusDays(1));

        assertDoesNotThrow(() -> recurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));
    }

    @Test
    void failedValidationDoesNotModifyWallet() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(80.0);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> recurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(80.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());
    }

    @Test
    void validationFailsWhenCardStatusIsLocked(){

        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(0.0);

        Card card = new Card();
        card.setStatus(CardStatus.LOCKED);
        wallet.setCard(card);

        assertThrows(IllegalCardChargeException.class,
                () -> recurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(0.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());
    }

    @Test
    void validationFailsWhenCardHasPendingRequest(){

        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(0.0);

        when(cardRequestService.CardHasPendingRequest(any(Card.class))).thenReturn(true);

        assertThrows(IllegalCardChargeException.class,
                () -> recurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(0.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());
    }
}
