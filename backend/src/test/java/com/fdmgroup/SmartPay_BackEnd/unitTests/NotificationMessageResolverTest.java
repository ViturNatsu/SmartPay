package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationMessageResolver;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;

/**
 * US-NOTIF-BE-06 Scenario 9: each recurring-payment failure reason maps to defined content that
 * identifies the reason, scheduled date, payee and amount, and directs the user to a remedy.
 */
class NotificationMessageResolverTest {

    private NotificationEventContext recurringContext() {
        return NotificationEventContext.builder()
                .amount(15.0)
                .counterpartyName("Netflix")
                .scheduledDate(LocalDate.of(2026, 9, 10))
                .frequency("MONTHLY")
                .build();
    }

    private void assertIdentifiesPayeeAmountAndDate(String message) {
        assertTrue(message.contains("Netflix"), message);
        assertTrue(message.contains("$15.00"), message);
        assertTrue(message.contains("2026-09-10"), message);
    }

    @Test
    void insufficientFunds_directsUserToTopUp() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_FAILED_INSUFFICIENT_FUNDS, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("top up"), msg);
    }

    @Test
    void perTransactionLimit_directsUserToAdjustLimit() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_FAILED_PER_TRANSACTION_LIMIT, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("per-transaction"), msg);
        assertTrue(msg.toLowerCase().contains("limit"), msg);
    }

    @Test
    void dailyLimit_directsUserToAdjustLimit() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_FAILED_DAILY_LIMIT, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("daily spending limit"), msg);
    }

    @Test
    void cardLocked_directsUserToUnlock() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_FAILED_CARD_LOCKED, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("unlock"), msg);
    }

    @Test
    void cardPendingReplacement_statesLockIsTemporary() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_FAILED_CARD_PENDING_REPLACEMENT, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("temporar"), msg);
    }

    @Test
    void cardDetailsChanged_containsNoFullNumberOrCvv_onlyLastFour() {
        NotificationEventContext ctx = NotificationEventContext.builder().cardLastFour("9012").build();
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.CARD_DETAILS_CHANGED, ctx);
        assertTrue(msg.contains("9012"), msg);
        assertTrue(msg.toLowerCase().contains("wallet"), msg);
    }

    @Test
    void reminder_includesPayeeAmountFrequencyAndDate() {
        String msg = NotificationMessageResolver.buildDetail(
                NotificationEventType.RECURRING_PAYMENT_REMINDER, recurringContext());
        assertIdentifiesPayeeAmountAndDate(msg);
        assertTrue(msg.toLowerCase().contains("monthly"), msg);
    }
}
