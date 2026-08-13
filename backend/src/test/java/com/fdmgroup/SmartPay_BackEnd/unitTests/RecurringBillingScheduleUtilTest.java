package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
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

    private RecurringPayee monthlyPayee(LocalDate startDate) {
        RecurringPayee payee = new RecurringPayee();
        payee.setPayeeId(1L);
        payee.setSchedule(Schedule.MONTHLY);
        payee.setDate(startDate);
        payee.setActive(true);
        return payee;
    }
}
