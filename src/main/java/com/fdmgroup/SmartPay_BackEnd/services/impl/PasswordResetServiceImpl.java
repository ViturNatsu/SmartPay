package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import lombok.AllArgsConstructor;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private EmailService emailService;
    private PasswordResetService passwordResetService;
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository) {
        this.passwordResetRepository = passwordResetRepository;
    }

    public HttpStatus startResetRequest(String email) {
        // TODO -- Check if account is currently locked and return TOO_MANY_REQUESTS if so.

        String	resetCode	= ""; // TODO
        String	resetUrl	= ""; // TODO
        String 	msgBody 	= "--- PASSWORD RESET --- \n\n" +
                "A password change was requested for your SmartPay account.\n\n" +
                "Here is your password reset code: " + resetCode + "\n\n" +
                "If this was you, follow the link below to reset your password:\n\n" +

                resetUrl +

                "\n\n" +
                "This link and code will expire in 40 minutes.\n\n" +
                "If you did not request this change, you can safely ignore this email.\n\n" +
                "Thank you,\n" +
                "The SmartPay Support Team";

        emailService.sendSimpleMail(new EmailDetails(email, msgBody, "Reset your Password"));
        return HttpStatus.ACCEPTED;
    }

    // Generates/Updates entry in PASSWORD_RESET table
    // TODO: Add hashing to encrypt the reset code
    public void createPasswordResetCode(String email) {
        //passwordResetRepository.findByEmail(email);
        PasswordReset passwordReset;
        Optional<PasswordReset> passwordResetOpt = Optional.of(passwordResetRepository.findByEmail(email));
        LocalDateTime now = LocalDateTime.now();
        String resetCode = generatePasswordResetCode();
        if(passwordResetOpt.isPresent()){
            passwordReset = passwordResetOpt.get();

            passwordReset.setTokenHash(resetCode);
            passwordReset.setType("CODE");
            passwordReset.setStatus("VALID");
            passwordReset.setCreatedAt(now);
            passwordReset.setExpiresAt(now.plusMinutes(45));
            if(passwordReset.getAttemptsRemaining() > 0){
                passwordReset.setAttemptsRemaining(passwordReset.getAttemptsRemaining() - 1);
            } else {
                LocalDateTime resetTime = passwordReset.getCreatedAt().plusHours(24);
                if(now.isAfter(resetTime)){
                    passwordReset.setAttemptsRemaining(4);
                } else {
                    // TODO: Reject their request
                }
            }
        } else {
            // Not present in DB need to create entry
            passwordReset = new PasswordReset(email);
            passwordReset.setTokenHash(resetCode);
            passwordReset.setType("CODE");
            passwordReset.setStatus("VALID");
            passwordReset.setAttemptsRemaining(4);
            passwordReset.setCreatedAt(now);
            passwordReset.setExpiresAt(now.plusMinutes(45));
        }

        passwordResetRepository.save(passwordReset);
    }

    public String generatePasswordResetCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
