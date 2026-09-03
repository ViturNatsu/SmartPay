package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.InvalidNotificationException;

public class NotificationEntityLinkUtil {
    private NotificationEntityLinkUtil() {
    }

    public static void link(NotificationCreateRequestDTO notification, NotificationRelatedEntityType type, Object entityId) {
        if (notification == null) {
            throw new InvalidNotificationException("Notification cannot be null");
        }

        if (type == null) {
            throw new InvalidNotificationException("Related entity type cannot be null");
        }

        if (entityId == null) {
            throw new InvalidNotificationException("Related entity ID cannot be null");
        }

        notification.setRelatedEntityType(type.name());
        notification.setRelatedEntityId(entityId.toString());
    }
}
