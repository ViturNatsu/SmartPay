package com.fdmgroup.SmartPay_BackEnd.Utility.notification;


import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.InvalidNotificationException;

public final class NotificationValidationUtil {

    private static final int MIN_TIER = 1;
    private static final int MAX_TIER = 4;

    private NotificationValidationUtil() {
    }

    public static void validate(NotificationCreateRequestDTO request) {

        if (request == null) {
            throw new InvalidNotificationException("Notification request is required");
        }

        if (request.getUserId() == null) {
            throw new InvalidNotificationException("User ID is required");
        }

        if (request.getType() == null) {
            throw new InvalidNotificationException("Notification type is required");
        }

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new InvalidNotificationException("Notification title is required");
        }

        if (request.getTier() == null) {
            throw new InvalidNotificationException("Notification tier is required");
        }

        if (request.getTier() < MIN_TIER || request.getTier() > MAX_TIER) {
            throw new InvalidNotificationException("Notification tier must be between 1 and 4");
        }
    }
}
