package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.*;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;

import java.util.HashMap;
import java.util.Map;

@Service
public class AccessCodeValidatorServiceImpl implements AccessCodeValidator {

    private final OtpRepository otpRepository;
    private final PasswordEncoder argonPasswordEncoder;
    private final AuditService auditService;
    private final UserService userService;

    public AccessCodeValidatorServiceImpl(OtpRepository otpRepository,
            PasswordEncoder argonPasswordEncoder, AuditService auditService, UserService userService) {
        this.otpRepository = otpRepository;
        this.argonPasswordEncoder = argonPasswordEncoder;
        this.auditService = auditService;
        this.userService = userService;
    }

    @Override
    public Otp validate(OtpDTO payload, HttpServletRequest httpRequest) {
        String accessCode = payload.getCode();
        Otp resetRequest = otpRepository.findByEmail(payload.getEmail())
                .orElseThrow(
                        () -> new EmailNotFoundException(
                                "No request is found for the provided email address."));

        if (!argonPasswordEncoder.matches(accessCode, resetRequest.getOtpHash())) {
            throw new AccessCodeMismatchException("This code is invalid. Please verify the code and try again.");
        }
        User user = userService.findByEmail(payload.getEmail());

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
        if (resetRequest.getAttemptsMade() >= 5) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "no_attempts_remaining");
            auditService.logEvent(AuditLog.INVALID_RESET_CODE, user, eventData, httpRequest);

            throw new AccountLockedException(
                    "We can’t process this request right now. Please try again later");
        }

        return resetRequest;
    }
}
