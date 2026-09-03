package com.fdmgroup.SmartPay_BackEnd.controllers.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;

@RestController
@RequestMapping("api/v1/notifications")
public class NotificationController {

    private static final int DEFAULT_LIMIT = 50;

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationListResponseDTO> getNotifications(
            @AuthenticationPrincipal User authenticatedUser) {

        return ResponseEntity.ok(
                notificationService.getNotificationsForUser(authenticatedUser.getId(), DEFAULT_LIMIT));
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissNotification(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long id) {

        notificationService.dismissNotification(authenticatedUser.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable Long id){

        notificationService.markNotificationAsRead(authenticatedUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
