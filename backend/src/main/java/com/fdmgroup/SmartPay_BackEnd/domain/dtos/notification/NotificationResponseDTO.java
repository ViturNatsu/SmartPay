package com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification;

import java.time.Instant;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponseDTO {

    private Long id;
    private NotificationType type;
    private String title;
    private String detail;
    private Instant createdAt;
}
