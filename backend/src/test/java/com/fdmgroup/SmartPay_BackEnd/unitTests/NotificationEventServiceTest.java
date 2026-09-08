package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.InvalidNotificationException;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationServiceImpl;

/**
 * Shared notification creation service (US-NOTIF-BE-06). Covers definition resolution (Scenarios 2/3),
 * duplicate prevention (Scenario 12), reminder dedup exemption, validation rejection (Scenario 13)
 * and failure isolation (Scenario 14).
 */
@ExtendWith(MockitoExtension.class)
class NotificationEventServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void createFromEvent_populatesTypeTierTitleMessageAndLink_fromDefinition() {
        NotificationEventContext ctx = NotificationEventContext.builder()
                .amount(75.0)
                .counterpartyName("Jane Doe")
                .build();

        notificationService.createFromEvent(
                NotificationEventType.OUTBOUND_P2P_SEND_SUCCESS, 1L, 123L, ctx);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertEquals(NotificationType.SUCCESS, saved.getType());
        assertEquals(3, saved.getTier());
        assertEquals("Payment successful", saved.getTitle());
        assertEquals("WALLET_TRANSACTION", saved.getRelatedEntityType());
        assertEquals("123", saved.getRelatedEntityId());
        assertTrue(saved.getDetail().contains("Jane Doe"));
        assertTrue(saved.getDetail().contains("$75.00"));
    }

    @Test
    void createFromEvent_resolvesRecurringFailureTierAndLinksCharge() {
        NotificationEventContext ctx = NotificationEventContext.builder()
                .amount(15.0)
                .counterpartyName("Netflix")
                .build();

        notificationService.createFromEvent(
                NotificationEventType.RECURRING_PAYMENT_FAILED_INSUFFICIENT_FUNDS, 7L, "CHARGE-1", ctx);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertEquals(NotificationType.WARNING, saved.getType());
        assertEquals(1, saved.getTier());
        assertEquals("RECURRING_BILLING_CHARGE", saved.getRelatedEntityType());
        assertEquals("CHARGE-1", saved.getRelatedEntityId());
    }

    @Test
    void createFromEvent_skipsDuplicate_whenEntityAlreadyNotified() {
        when(notificationRepository.existsByUser_IdAndRelatedEntityTypeAndRelatedEntityId(
                1L, "WALLET_TRANSACTION", "123")).thenReturn(true);

        notificationService.createFromEvent(
                NotificationEventType.OUTBOUND_P2P_SEND_SUCCESS, 1L, 123L,
                NotificationEventContext.builder().amount(10.0).build());

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void createFromEvent_isExemptFromGenericDedup_forReminders() {
        // Reminders are deduplicated per cycle by the reminder service, so the generic entity check
        // must not run for them (it would block every cycle after the first).
        notificationService.createFromEvent(
                NotificationEventType.RECURRING_PAYMENT_REMINDER, 1L, 55L,
                NotificationEventContext.builder().amount(20.0).counterpartyName("Gym").build());

        verify(notificationRepository, never())
                .existsByUser_IdAndRelatedEntityTypeAndRelatedEntityId(anyLong(), anyString(), anyString());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createFromEvent_throwsInvalidNotification_whenEventTypeMissing() {
        assertThrows(InvalidNotificationException.class,
                () -> notificationService.createFromEvent(null, 1L, 1L, NotificationEventContext.empty()));
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void createNotification_throwsInvalidNotification_whenTierOutOfRange() {
        NotificationCreateRequestDTO bad = new NotificationCreateRequestDTO();
        bad.setUserId(1L);
        bad.setType(NotificationType.INFO);
        bad.setTitle("x");
        bad.setTier(9);

        assertThrows(InvalidNotificationException.class,
                () -> notificationService.createNotification(bad));
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void createFromEventSafely_doesNotThrow_whenPersistenceFails() {
        when(notificationRepository.save(any(Notification.class)))
                .thenThrow(new RuntimeException("db down"));

        assertDoesNotThrow(() -> notificationService.createFromEventSafely(
                NotificationEventType.OUTBOUND_P2P_SEND_SUCCESS, 1L, 123L,
                NotificationEventContext.builder().amount(10.0).build()));

        verify(notificationRepository).save(any(Notification.class));
    }
}
