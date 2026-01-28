package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import lombok.Data;

@Data
public class KeepAliveDTO {
    private String refreshToken;
    private String accessToken;
}

