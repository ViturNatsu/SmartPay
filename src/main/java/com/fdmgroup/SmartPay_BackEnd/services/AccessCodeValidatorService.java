package com.fdmgroup.SmartPay_BackEnd.services;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.AccessCodePayload;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;

@Service
public class AccessCodeValidatorService {

    private final PasswordResetRepository passwordResetRepository;

    public AccessCodeValidatorService(PasswordResetRepository passwordResetRepository) {
        this.passwordResetRepository = passwordResetRepository;
    }

    public void validate(AccessCodePayload payload) {

        String accessCode = payload.getAccessCode();

        String email = payload.getEmail();

        PasswordReset resetRequest = passwordResetRepository.findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("No reset request found for the provided email"));

        if (resetRequest.getTokenHash().equals(accessCode)) {
            return;
        } else {
            throw new IllegalArgumentException("Invalid access code!");
        }
    }
}
