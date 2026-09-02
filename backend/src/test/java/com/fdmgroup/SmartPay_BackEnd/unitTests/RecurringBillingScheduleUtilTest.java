package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

class RecurringBillingScheduleUtilTest {

    @Test
    void resolveDueBillingCycleDate_monthlyOnDueDay() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 1, 15));

        Optional<LocalDate> due = RecurringBillingScheduleUtil.resolveDueBillingCycleDate(
                payee,
                LocalDate.of(2026, 8, 15));

        assertTrue(due.isPresent());
        assertEquals(LocalDate.of(2026, 8, 15), due.get());
    }

    @Test
    void resolveDueBillingCycleDate_monthlyNotDue() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 1, 15));

        Optional<LocalDate> due = RecurringBillingScheduleUtil.resolveDueBillingCycleDate(
                payee,
                LocalDate.of(2026, 8, 14));

        assertTrue(due.isEmpty());
    }

    @Test
    void nextBillingCycleDate_advancesMonthlyCycle() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 1, 31));

        LocalDate next = RecurringBillingScheduleUtil.nextBillingCycleDate(
                payee,
                LocalDate.of(2026, 1, 31));

        assertEquals(LocalDate.of(2026, 2, 28), next);
    }

    // resolveResumeCycleDate Tests

    @Test
    void resolveResumeCycleDate_leavesDateUnchanged_whenDateIsInTheFuture() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 8, 20));

        LocalDate resolved = RecurringBillingScheduleUtil.resolveResumeCycleDate(
                payee,
                LocalDateTime.of(2026, 8, 15, 3, 0));

        assertEquals(LocalDate.of(2026, 8, 20), resolved);
    }

    @Test
    void resolveResumeCycleDate_leavesDateUnchanged_whenDateIsTodayAndBeforeTriggerTime() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 8, 15));

        LocalDate resolved = RecurringBillingScheduleUtil.resolveResumeCycleDate(
                payee,
                LocalDateTime.of(2026, 8, 15, 1, 0));

        assertEquals(LocalDate.of(2026, 8, 15), resolved);
    }

    @Test
    void resolveResumeCycleDate_advancesPastToday_whenDateIsTodayAndAfterTriggerTime() {
        RecurringPayee payee = monthlyPayee(LocalDate.of(2026, 8, 15));

        LocalDate resolved = RecurringBillingScheduleUtil.resolveResumeCycleDate(
                payee,
                LocalDateTime.of(2026, 8, 15, 3, 0));

        assertEquals(LocalDate.of(2026, 9, 15), resolved);
    }

    @Test
    void resolveResumeCycleDate_advancesOneIntervalAndStops_whenCatchUpLandsOnTodayBeforeTriggerTime() {
        RecurringPayee payee = weeklyPayee(LocalDate.of(2026, 8, 8));

        LocalDate resolved = RecurringBillingScheduleUtil.resolveResumeCycleDate(
                payee,
                LocalDateTime.of(2026, 8, 15, 1, 0));

        assertEquals(LocalDate.of(2026, 8, 15), resolved);
    }

    @Test
    void resolveResumeCycleDate_advancesMultipleIntervals_whenSeveralCyclesMissed() {
        RecurringPayee payee = weeklyPayee(LocalDate.of(2026, 7, 29));

        LocalDate resolved = RecurringBillingScheduleUtil.resolveResumeCycleDate(
                payee,
                LocalDateTime.of(2026, 8, 15, 10, 0));

        assertEquals(LocalDate.of(2026, 8, 19), resolved);
    }

    private RecurringPayee monthlyPayee(LocalDate startDate) {
        RecurringPayee payee = new RecurringPayee();
        payee.setPayeeId(1L);
        payee.setSchedule(Schedule.MONTHLY);
        payee.setDate(startDate);
        payee.setActive(true);
        return payee;
    }

    private RecurringPayee weeklyPayee(LocalDate startDate) {
        RecurringPayee payee = new RecurringPayee();
        payee.setPayeeId(1L);
        payee.setSchedule(Schedule.WEEKLY);
        payee.setDate(startDate);
        payee.setActive(true);
        return payee;
    }
}
