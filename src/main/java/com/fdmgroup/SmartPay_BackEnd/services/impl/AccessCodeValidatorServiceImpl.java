package com.fdmgroup.SmartPay_BackEnd.services.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;

@Service
public class AccessCodeValidatorServiceImpl implements AccessCodeValidator {

    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder argonPasswordEncoder;

    public AccessCodeValidatorServiceImpl(PasswordResetRepository passwordResetRepository,
            PasswordEncoder argonPasswordEncoder) {
        this.passwordResetRepository = passwordResetRepository;
        this.argonPasswordEncoder = argonPasswordEncoder;
    }

    @Override
    public void validate(ConfirmCodeDTO payload) {

        String accessCode = payload.getAccessCode();

        String email = payload.getEmail();

        PasswordReset resetRequest = passwordResetRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No reset request found for the provided email"));

        if (resetRequest.isExpired() || resetRequest.isUsed()) {
            throw new AccessCodeExpiredException(
                    "This code has expired or has already been used. Please request a new one.");
        }

        if (!argonPasswordEncoder.matches(accessCode, resetRequest.getTokenHash())) {
            throw new AccessCodeMismatchException("This code is invalid. Please verify the code and try again.");
        }
    }
}
