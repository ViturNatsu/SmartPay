package com.fdmgroup.SmartPay_BackEnd.services.notification;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;

public interface NotificationService {

    NotificationListResponseDTO getNotificationsForUser(Long userId, int limit);

    void createNotification(NotificationCreateRequestDTO request);

    /**
     * Shared creation entry point (US-NOTIF-BE-06). Resolves message, tier, type, category and the
     * linked entity from the event definition, applies duplicate prevention, then persists. Throws
     * {@code InvalidNotificationException} for invalid requests (Scenario 13). Prefer
     * {@link #createFromEventSafely} at trigger sites so a notification failure cannot break the
     * activity that triggered it (Scenario 14).
     */
    void createFromEvent(NotificationEventType eventType, Long userId, Object relatedEntityId,
                         NotificationEventContext context);

    /** Failure-isolated variant of {@link #createFromEvent}: never throws. */
    void createFromEventSafely(NotificationEventType eventType, Long userId, Object relatedEntityId,
                              NotificationEventContext context);

    boolean hasActiveOfType(Long userId, NotificationType type);

    void dismissNotification(Long userId, Long notificationId);

    void markNotificationAsRead(Long userId, Long notificationId);
}
