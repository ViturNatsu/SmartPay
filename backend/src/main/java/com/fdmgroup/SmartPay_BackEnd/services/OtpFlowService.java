package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import org.springframework.http.HttpStatus;

public interface OtpFlowService {
    HttpStatus requestOtp(String email, OtpType type);
}
