package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private AuditService auditService;
    private OtpService otpService;
    private UserService userService;
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void resetPasswordWithOTP(PasswordResetWithOtpDto request, HttpServletRequest httpRequest) {
        // validate password match
        if (!request.passwordsMatch()) {
            throw new PasswordResetDoNotMatchException("Password does not match.");
        }
        // Find the otp record and validate
        Otp otpEntity = otpService
                .verifyOtp(new OtpDTO(request.getEmail(), request.getAccessCode(), OtpType.FORGOT_PASSWORD));
        User user = userService.findByEmail(otpEntity.getEmail());

        // Update password
        user.setPassword(passwordEncoder.encode(request.getPassword1()));
        user.setLastPasswordChangeAt(LocalDateTime.now());
        userService.save(user);

        // Mark OTP as used
        otpEntity.markAsUsed();
        otpService.save(otpEntity);

        // Log successful password reset
        // audit the record of change password
        auditService.logEvent(AuditLog.PASSWORD_RESET_COMPLETED, user, httpRequest);
        log.info("Password successfully reset with OTP for user: {}", user.getEmail());

    }

}
