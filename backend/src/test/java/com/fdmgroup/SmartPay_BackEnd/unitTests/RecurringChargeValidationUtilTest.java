package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringChargeValidationUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class RecurringChargeValidationUtilTest {
    private Wallet wallet;
    private LocalDate processingDate;

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
        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                wallet, 50.0, processingDate));
    }

    //AC1, AC2
    @Test
    void rejectsChargeWhenFundsAreInsufficient() {
        assertThrows(InsufficientFundsException.class,
                () -> RecurringChargeValidationUtil.validate(
                        wallet, 150.0, processingDate));
    }

    @Test
    void acceptsChargeWhenBalanceExactlyMatchesAmount() {
        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                        wallet, 100.0, processingDate));
    }

    //AC7
    @Test
    void acceptsChargeWhenWithinPerTransactionLimit() {
        wallet.setPerTransactionLimit(80.0);
        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                        wallet, 50.0, processingDate));
    }

    //AC8
    @Test
    void rejectsChargeWhenPerTransactionLimitExceeds() {
        wallet.setPerTransactionLimit(80.0);
        assertThrows(InvalidWithdrawAmountException.class,
                () -> RecurringChargeValidationUtil.validate(
                wallet, 90.0, processingDate));
    }

    //AC12
    @Test
    void acceptsChargeWhenAmountMatchesPerTransactionLimit() {
        wallet.setPerTransactionLimit(80.0);

//        when(RecurringChargeValidationUtil.).

        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                wallet, 80.0, processingDate));
    }

    @Test
    void acceptsChargeWhenWithinDailySpendingLimit() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(40.0);
        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));
    }

    @Test
    void acceptsChargeWhenDailySpendingLimitExceeds() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(80.0);
        assertThrows(InvalidWithdrawAmountException.class,
                () -> RecurringChargeValidationUtil.validate(
                        wallet, 100.0, processingDate));
    }

    @Test
    void acceptsChargeWhenAmountsMatchesDailySpendingLimit() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(70.0);
        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                wallet, 30.0, processingDate));
    }

    @Test
    void ignoresDailySpendFromPreviousDate() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(90.0);
        wallet.setDailySpentDate(processingDate.minusDays(1));

        assertDoesNotThrow(() -> RecurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));
    }

    @Test
    void failedValidationDoesNotModifyWallet() {
        wallet.setDailySpendingLimit(100.0);
        wallet.setDailySpentAmount(80.0);

        assertThrows(InvalidWithdrawAmountException.class,
                () -> RecurringChargeValidationUtil.validate(
                        wallet, 30.0, processingDate));

        assertEquals(100.0, wallet.getBalance());
        assertEquals(80.0, wallet.getDailySpentAmount());
        assertEquals(processingDate, wallet.getDailySpentDate());
    }

}
