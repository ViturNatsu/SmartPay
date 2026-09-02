package com.fdmgroup.SmartPay_BackEnd.services.notification;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationListResponseDTO;

public interface NotificationService {

    NotificationListResponseDTO getNotificationsForUser(Long userId, int limit);

    void createNotification(NotificationCreateRequestDTO request);

    boolean hasActiveOfType(Long userId, NotificationType type);

    void dismissNotification(Long userId, Long notificationId);
}
