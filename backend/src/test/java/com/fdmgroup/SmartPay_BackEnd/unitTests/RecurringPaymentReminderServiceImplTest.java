package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringPaymentReminderServiceImpl;

/**
 * US-NOTIF-BE-06 Scenarios 10 &amp; 11: upcoming recurring payment reminders, lead-time suppression,
 * and one-reminder-per-cycle deduplication.
 */
@ExtendWith(MockitoExtension.class)
class RecurringPaymentReminderServiceImplTest {

    @Mock
    private RecurringPayeeRepository recurringPayeeRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private RecurringPaymentReminderServiceImpl reminderService;

    private static final LocalDate TODAY = LocalDate.of(2026, 9, 3);

    private RecurringPayee payee(long id, Schedule schedule, LocalDate date) {
        RecurringPayee p = new RecurringPayee();
        p.setPayeeId(id);
        p.setOwner(User.builder().id(9L).build());
        p.setPayeeName("Netflix");
        p.setAmount(new BigDecimal("15.00"));
        p.setSchedule(schedule);
        p.setDate(date);
        p.setType(RecurringPaymentType.SUBSCRIPTION);
        p.setStatus(RecurringPaymentStatus.ACTIVE);
        return p;
    }

    private void setLeadTime(int days) {
        ReflectionTestUtils.setField(reminderService, "leadTimeDays", days);
    }

    @Test
    void createsReminder_whenWithinLeadWindowAndNotYetReminded() {
        setLeadTime(3);
        // Scheduled two days out — inside the 3-day lead window.
        when(recurringPayeeRepository.findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE))
                .thenReturn(List.of(payee(1L, Schedule.MONTHLY, TODAY.plusDays(2))));
        when(notificationRepository.existsByUser_IdAndRelatedEntityTypeAndRelatedEntityIdAndCreatedAtAfter(
                anyLong(), anyString(), anyString(), any(Instant.class))).thenReturn(false);

        reminderService.sendUpcomingReminders(TODAY);

        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.RECURRING_PAYMENT_REMINDER), eq(9L), eq(1L),
                any(NotificationEventContext.class));
    }

    @Test
    void suppressesReminder_whenIntervalShorterThanLeadTime() {
        setLeadTime(10);
        // Weekly interval (7 days) is shorter than a 10-day lead time.
        when(recurringPayeeRepository.findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE))
                .thenReturn(List.of(payee(1L, Schedule.WEEKLY, TODAY.plusDays(2))));

        reminderService.sendUpcomingReminders(TODAY);

        verifyNoInteractions(notificationService);
    }

    @Test
    void doesNotDuplicate_whenReminderAlreadyExistsForCycle() {
        setLeadTime(3);
        when(recurringPayeeRepository.findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE))
                .thenReturn(List.of(payee(1L, Schedule.MONTHLY, TODAY.plusDays(2))));
        when(notificationRepository.existsByUser_IdAndRelatedEntityTypeAndRelatedEntityIdAndCreatedAtAfter(
                anyLong(), anyString(), anyString(), any(Instant.class))).thenReturn(true);

        reminderService.sendUpcomingReminders(TODAY);

        verifyNoInteractions(notificationService);
    }

    @Test
    void doesNotRemind_whenPaymentIsOutsideLeadWindow() {
        setLeadTime(3);
        // Scheduled 30 days out — well before the lead window opens.
        when(recurringPayeeRepository.findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE))
                .thenReturn(List.of(payee(1L, Schedule.MONTHLY, TODAY.plusDays(30))));

        reminderService.sendUpcomingReminders(TODAY);

        verifyNoInteractions(notificationService);
    }
}
