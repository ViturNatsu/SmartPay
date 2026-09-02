package com.fdmgroup.SmartPay_BackEnd.unitTests;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationTier;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.InvalidNotificationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.notification.Notification;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.NotificationNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.notification.NotificationRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationServiceImpl;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @Test
    void getNotificationsForUser_returnsMappedDtosAndTotalCount() {
        Instant createdAt = Instant.now();
        Instant readAt = Instant.now().minusSeconds(60);
        Instant dismissedAt = Instant.now().minusSeconds(30);

        Notification notification = new Notification();
        notification.setId(1L);
        notification.setType(NotificationType.SUCCESS);
        notification.setTitle("Payment successful");
        notification.setDetail("$75.00 sent");
        notification.setTier(NotificationTier.T3.getValue());
        notification.setRead(true);
        notification.setReadAt(readAt);
        notification.setDismissed(true);
        notification.setDismissedAt(dismissedAt);
        notification.setRelatedEntityType("WALLET_TRANSACTION");
        notification.setRelatedEntityId("123");
        notification.setCreatedAt(createdAt);

        when(notificationRepository.findActiveNotificationsByUserId(any(), any()))
                .thenReturn(List.of(notification));
        when(notificationRepository.countByUser_IdAndDismissedFalse(1L))
                .thenReturn(1L);

        NotificationListResponseDTO result = notificationService.getNotificationsForUser(1L, 50);
        assertEquals(1, result.getNotifications().size());

        var dto = result.getNotifications().get(0);
        assertEquals(1L, dto.getId());
        assertEquals(NotificationType.SUCCESS, dto.getType());
        assertEquals("Payment successful", dto.getTitle());
        assertEquals("$75.00 sent", dto.getDetail());
        assertEquals(3, dto.getTier());
        assertEquals(Boolean.TRUE, dto.getRead());
        assertEquals(readAt, dto.getReadAt());
        assertEquals(Boolean.TRUE, dto.getDismissed());
        assertEquals(dismissedAt, dto.getDismissedAt());
        assertEquals("WALLET_TRANSACTION", dto.getRelatedEntityType());
        assertEquals("123", dto.getRelatedEntityId());
        assertEquals(createdAt, dto.getCreatedAt());
        assertEquals(1L, result.getTotalCount());

    }

    @Test
    void createNotification_persistsProvidedNotificationData() {
        User user = User.builder().id(1L).build();
        when(userRepository.getReferenceById(1L)).thenReturn(user);

        NotificationCreateRequestDTO request = new NotificationCreateRequestDTO();
        request.setUserId(1L);
        request.setType(NotificationType.WARNING);
        request.setTitle("Low wallet balance");
        request.setDetail("Below $250");
        request.setTier(NotificationTier.T2.getValue());
        request.setRelatedEntityType("WALLET");
        request.setRelatedEntityId("123");

        notificationService.createNotification(request);
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());
        Notification saved = captor.getValue();

        assertEquals(user, saved.getUser());
        assertEquals(NotificationType.WARNING, saved.getType());
        assertEquals("Low wallet balance", saved.getTitle());
        assertEquals("Below $250", saved.getDetail());
        assertEquals(2, saved.getTier());
        assertEquals("WALLET", saved.getRelatedEntityType());
        assertEquals("123", saved.getRelatedEntityId());
        assertFalse(saved.getRead());
        assertFalse(saved.getDismissed());
    }

    @Test
    void hasActiveOfType_delegatesToRepository() {
        when(notificationRepository.existsByUser_IdAndTypeAndDismissedFalse(1L, NotificationType.WARNING))
                .thenReturn(true);

        assertTrue(notificationService.hasActiveOfType(1L, NotificationType.WARNING));

        when(notificationRepository.existsByUser_IdAndTypeAndDismissedFalse(1L, NotificationType.SECURITY))
                .thenReturn(false);

        assertFalse(notificationService.hasActiveOfType(1L, NotificationType.SECURITY));
    }

    @Test
    void dismissNotification_marksDismissedWhenOwnedByUser() {
        User owner = User.builder().id(1L).build();
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUser(owner);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        notificationService.dismissNotification(1L, 10L);

        assertTrue(notification.getDismissed());
        assertNotNull(notification.getDismissedAt());
        verify(notificationRepository).save(notification);
    }

    @Test
    void dismissNotification_throwsWhenNotOwnedByUser() {
        User owner = User.builder().id(1L).build();
        Notification notification = new Notification();
        notification.setId(10L);
        notification.setUser(owner);

        when(notificationRepository.findById(10L)).thenReturn(Optional.of(notification));

        assertThrows(NotificationNotFoundException.class,
                () -> notificationService.dismissNotification(2L, 10L));

        assertFalse(notification.getDismissed());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void dismissNotification_throwsWhenNotFound() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotificationNotFoundException.class,
                () -> notificationService.dismissNotification(1L, 99L));
    }

    @Test
    void createNotification_throwsWhenTierIsOutOfRange() {
        NotificationCreateRequestDTO request = new NotificationCreateRequestDTO();
        request.setUserId(1L);
        request.setType(NotificationType.WARNING);
        request.setTitle("Test notification");
        request.setTier(5);

        assertThrows(InvalidNotificationException.class,
                () -> notificationService.createNotification(request));

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createNotification_throwsWhenRequiredFieldTitleIsMissing() {
        NotificationCreateRequestDTO request = new NotificationCreateRequestDTO();
        request.setUserId(1L);
        request.setType(NotificationType.WARNING);
        request.setTier(2);

        assertThrows(InvalidNotificationException.class,
                () -> notificationService.createNotification(request));

        verify(notificationRepository, never()).save(any());
    }
}
