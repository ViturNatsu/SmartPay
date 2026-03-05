package com.fdmgroup.SmartPay_BackEnd.services.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.PasswordResetWithOtpDto;

public interface PasswordResetService {
    void resetPasswordWithOTP(@Valid PasswordResetWithOtpDto request, HttpServletRequest httpRequest);
}
