package com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth;

import lombok.Data;

@Data
public class KeepAliveDTO {
    private String refreshToken;
    private String accessToken;
}

