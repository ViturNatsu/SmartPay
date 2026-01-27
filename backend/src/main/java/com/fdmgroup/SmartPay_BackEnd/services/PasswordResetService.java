package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;

public interface PasswordResetService {
    void resetPasswordWithOTP(@Valid PasswordResetWithOtpDto request, HttpServletRequest httpRequest);
    HttpStatus startResetRequest(String email);
    String generatePasswordResetCode();
}
