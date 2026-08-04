package com.fdmgroup.SmartPay_BackEnd.unitTests;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
        Notification securityNotification = new Notification();
        securityNotification.setId(1L);
        securityNotification.setType(NotificationType.SECURITY);
        securityNotification.setTitle("New sign-in detected");
        securityNotification.setPriority(0);
        securityNotification.setCreatedAt(Instant.now());

        when(notificationRepository.findByUser_IdAndDismissedFalseOrderByPriorityAscCreatedAtDesc(any(), any()))
                .thenReturn(List.of(securityNotification));
        when(notificationRepository.countByUser_IdAndDismissedFalse(1L)).thenReturn(7L);

        NotificationListResponseDTO result = notificationService.getNotificationsForUser(1L, 50);

        assertEquals(1, result.getNotifications().size());
        assertEquals("New sign-in detected", result.getNotifications().get(0).getTitle());
        assertEquals(7L, result.getTotalCount());
    }

    @Test
    void createNotification_persistsWithPriorityDerivedFromType() {
        User user = User.builder().id(1L).build();
        when(userRepository.getReferenceById(1L)).thenReturn(user);

        notificationService.createNotification(1L, NotificationType.WARNING, "Low wallet balance", "Below $250");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals(user, saved.getUser());
        assertEquals(NotificationType.WARNING, saved.getType());
        assertEquals("Low wallet balance", saved.getTitle());
        assertEquals("Below $250", saved.getDetail());
        assertEquals(1, saved.getPriority());
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

        assertTrue(notification.isDismissed());
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

        assertFalse(notification.isDismissed());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void dismissNotification_throwsWhenNotFound() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotificationNotFoundException.class,
                () -> notificationService.dismissNotification(1L, 99L));
    }
}
