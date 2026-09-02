package com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequestDTO {
    private Long userId;

    private NotificationType type;

    private String title;

    private String detail;

    private Integer tier;

    private String relatedEntityType;
    private String relatedEntityId;
}
