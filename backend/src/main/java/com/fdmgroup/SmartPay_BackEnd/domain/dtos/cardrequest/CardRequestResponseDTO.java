package com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardrequest.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CardRequestResponseDTO {
    private Long requestId;
    private String userName;
    private String cardLastFourDigits;
    private LocalDateTime expirationDate;
    private long previousRequestCount;
    private RequestStatus requestStatus;
    private LocalDateTime requestCreatedAt;
    private String requestReason;
    private String denyReason;
}
