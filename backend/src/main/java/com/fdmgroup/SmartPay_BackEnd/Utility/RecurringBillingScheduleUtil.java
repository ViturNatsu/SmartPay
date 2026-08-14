package com.fdmgroup.SmartPay_BackEnd.Utility;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

public final class RecurringBillingScheduleUtil {

    private RecurringBillingScheduleUtil() {
    }

    public static String buildIdempotencyKey(long recurringPayeeId, LocalDate billingCycleDate) {
        return recurringPayeeId + ":" + billingCycleDate;
    }

    /**
     * Returns the billing cycle date when {@code payee} is due on {@code today}, otherwise empty.
     */
    public static Optional<LocalDate> resolveDueBillingCycleDate(RecurringPayee payee, LocalDate today) {
        LocalDate anchor = payee.getDate();
        if (today.isBefore(anchor)) {
            return Optional.empty();
        }
        if (payee.getEndDate() != null && today.isAfter(payee.getEndDate())) {
            return Optional.empty();
        }

        return switch (payee.getSchedule()) {
            case WEEKLY -> isIntervalDue(anchor, today, 7) ? Optional.of(today) : Optional.empty();
            case BIWEEKLY -> isIntervalDue(anchor, today, 14) ? Optional.of(today) : Optional.empty();
            case MONTHLY -> resolveMonthlyCycle(anchor, today);
            case YEARLY -> resolveYearlyCycle(anchor, today);
        };
    }

    public static LocalDate nextBillingCycleDate(RecurringPayee payee, LocalDate currentCycleDate) {
        return switch (payee.getSchedule()) {
            case WEEKLY -> currentCycleDate.plusWeeks(1);
            case BIWEEKLY -> currentCycleDate.plusWeeks(2);
            case MONTHLY -> nextMonthlyCycle(payee.getDate(), currentCycleDate);
            case YEARLY -> currentCycleDate.plusYears(1);
        };
    }

    private static boolean isIntervalDue(LocalDate anchor, LocalDate today, int intervalDays) {
        long daysBetween = ChronoUnit.DAYS.between(anchor, today);
        return daysBetween >= 0 && daysBetween % intervalDays == 0;
    }

    private static Optional<LocalDate> resolveMonthlyCycle(LocalDate anchor, LocalDate today) {
        int billingDay = Math.min(anchor.getDayOfMonth(), today.lengthOfMonth());
        LocalDate cycleDate = LocalDate.of(today.getYear(), today.getMonth(), billingDay);
        if (cycleDate.equals(today)) {
            return Optional.of(cycleDate);
        }
        return Optional.empty();
    }

    private static Optional<LocalDate> resolveYearlyCycle(LocalDate anchor, LocalDate today) {
        if (anchor.getMonth() != today.getMonth()) {
            return Optional.empty();
        }
        int billingDay = Math.min(anchor.getDayOfMonth(), today.lengthOfMonth());
        LocalDate cycleDate = LocalDate.of(today.getYear(), today.getMonth(), billingDay);
        if (cycleDate.equals(today)) {
            return Optional.of(cycleDate);
        }
        return Optional.empty();
    }

    private static LocalDate nextMonthlyCycle(LocalDate anchor, LocalDate currentCycleDate) {
        LocalDate candidate = currentCycleDate.plusMonths(1);
        int billingDay = Math.min(anchor.getDayOfMonth(), candidate.lengthOfMonth());
        return LocalDate.of(candidate.getYear(), candidate.getMonth(), billingDay);
    }
}
