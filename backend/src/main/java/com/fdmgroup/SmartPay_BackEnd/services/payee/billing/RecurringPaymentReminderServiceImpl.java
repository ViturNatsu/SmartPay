package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationRelatedEntityType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringPaymentReminderServiceImpl implements RecurringPaymentReminderService {

    private final RecurringPayeeRepository recurringPayeeRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    /** Configurable system value; defaults to three days before the scheduled date. */
    @Value("${notification.reminder.lead-time-days:3}")
    private int leadTimeDays;

    @Override
    public void sendUpcomingReminders(LocalDate referenceDate) {
        List<RecurringPayee> activePayees =
                recurringPayeeRepository.findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE);
        for (RecurringPayee payee : activePayees) {
            // Failure isolation: one payee's reminder failure must not stop the others.
            try {
                maybeSendReminder(payee, referenceDate);
            } catch (RuntimeException ex) {
                log.warn("Failed to evaluate reminder for payee {}: {}", payee.getPayeeId(), ex.getMessage());
            }
        }
    }

    private void maybeSendReminder(RecurringPayee payee, LocalDate referenceDate) {
        LocalDate scheduledDate = payee.getDate();
        if (scheduledDate == null) {
            return;
        }

        // Scenario 11 — suppress reminders when the payment interval is shorter than the lead time.
        int intervalDays = intervalDays(payee.getSchedule());
        if (intervalDays < leadTimeDays) {
            return;
        }

        // Only fire once the lead point is reached and before the payment is past due.
        LocalDate windowStart = scheduledDate.minusDays(leadTimeDays);
        if (referenceDate.isBefore(windowStart) || referenceDate.isAfter(scheduledDate)) {
            return;
        }

        Long userId = payee.getOwner().getId();

        // Scenario 10 — one reminder per billing cycle. The payee's scheduled date advances each
        // cycle, so scoping the existence check to this cycle's lead window keeps future cycles
        // eligible while preventing repeats within the same cycle.
        Instant cycleWindowStart = windowStart.atStartOfDay(ZoneId.systemDefault()).toInstant();
        boolean alreadyReminded = notificationRepository
                .existsByUser_IdAndRelatedEntityTypeAndRelatedEntityIdAndCreatedAtAfter(
                        userId,
                        NotificationRelatedEntityType.RECURRING_PAYEE.name(),
                        String.valueOf(payee.getPayeeId()),
                        cycleWindowStart);
        if (alreadyReminded) {
            return;
        }

        NotificationEventContext context = NotificationEventContext.builder()
                .amount(payee.getAmount() != null ? payee.getAmount().doubleValue() : null)
                .counterpartyName(payee.getPayeeName())
                .scheduledDate(scheduledDate)
                .frequency(payee.getSchedule() != null ? payee.getSchedule().name() : null)
                .build();

        notificationService.createFromEventSafely(
                NotificationEventType.RECURRING_PAYMENT_REMINDER,
                userId,
                payee.getPayeeId(),
                context);
    }

    private int intervalDays(Schedule schedule) {
        if (schedule == null) {
            return Integer.MAX_VALUE;
        }
        return switch (schedule) {
            case WEEKLY -> 7;
            case BIWEEKLY -> 14;
            case MONTHLY -> 30;
            case YEARLY -> 365;
        };
    }
}
