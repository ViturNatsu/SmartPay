package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.*;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;

import java.util.HashMap;
import java.util.Map;

@Service
public class AccessCodeValidatorServiceImpl implements AccessCodeValidator {

    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder argonPasswordEncoder;
    private final AuditService auditService;
    private final UserService userService;

    public AccessCodeValidatorServiceImpl(PasswordResetRepository passwordResetRepository,
            PasswordEncoder argonPasswordEncoder, AuditService auditService, UserService userService) {
        this.passwordResetRepository = passwordResetRepository;
        this.argonPasswordEncoder = argonPasswordEncoder;
        this.auditService = auditService;
        this.userService = userService;
    }

    @Override
    public PasswordReset validate(ConfirmCodeDTO payload, HttpServletRequest httpRequest) {
        String accessCode = payload.getAccessCode();
        PasswordReset resetRequest = passwordResetRepository.findByEmail(payload.getEmail())
                .orElseThrow(
                        () -> new EmailNotFoundException(
                                "No request is found for the provided email address."));

        if (!argonPasswordEncoder.matches(accessCode, resetRequest.getTokenHash())) {
            throw new AccessCodeMismatchException("This code is invalid. Please verify the code and try again.");
        }
        User user = userService.findUserByEmail(payload.getEmail());

        // Check if OTP is expired
        if (resetRequest.isExpired()) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "expired");
            auditService.logEvent(AuditLog.PASSWORD_RESET_FAILED_EXPIRED, user, eventData, httpRequest);

            throw new AccessCodeExpiredException(
                    "This code has expired or has already been used. Please request a new code");
        }

        // Check if OTP is already used
        if (resetRequest.isUsed()) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "already_used");
            auditService.logEvent(AuditLog.PASSWORD_RESET_FAILED_USED, user, eventData, httpRequest);

            throw new AccessCodeUsedException(
                    "This code has expired or has already been used. Please request a new code");
        }
        // Check if OTP has attempts remaining
        if (resetRequest.getAttemptsRemaining() <= 0) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "no_attempts_remaining");
            auditService.logEvent(AuditLog.INVALID_RESET_CODE, user, eventData, httpRequest);

            throw new AccountLockedException(
                    "We can’t process this request right now. Please try again later");
        }

        return resetRequest;
    }
}
