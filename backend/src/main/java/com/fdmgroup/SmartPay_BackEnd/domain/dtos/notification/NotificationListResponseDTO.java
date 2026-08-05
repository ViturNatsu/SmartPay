package com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class NotificationListResponseDTO {

    private List<NotificationResponseDTO> notifications;
    private long totalCount;
}
