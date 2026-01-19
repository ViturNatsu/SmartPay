package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

public interface OtpPasswordResetService {
    void resetPasswordWithOTP(@Valid PasswordResetWithOtpDto request, HttpServletRequest httpRequest);
}
