package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {
    PasswordResetRepository passwordResetRepository;
    AuditService auditService;
    EmailService emailService;
    UserService userService;
    PasswordEncoder passwordEncoder;
    AccessCodeValidator accessCodeValidator;

    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository,
            AuditService auditService, EmailService emailService,
            UserService userService, PasswordEncoder passwordEncoder,
            AccessCodeValidator accessCodeValidator) {
        this.passwordResetRepository = passwordResetRepository;
        this.auditService = auditService;
        this.emailService = emailService;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.accessCodeValidator = accessCodeValidator;
    }

    public HttpStatus startResetRequest(String email) {
        // TODO -- Check if account is currently locked and return TOO_MANY_REQUESTS if
        // so.

        String resetCode = ""; // TODO
        String resetUrl = ""; // TODO
        String msgBody = "--- PASSWORD RESET --- \n\n" +
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
    public String createPasswordResetCode(String email) {
        // passwordResetRepository.findByEmail(email);
        PasswordReset passwordReset;
        Optional<PasswordReset> passwordResetOpt = passwordResetRepository.findByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        String resetCode = generatePasswordResetCode();
        if (passwordResetOpt.isPresent()) {
            passwordReset = passwordResetOpt.get();

            passwordReset.setTokenHash(resetCode);
            passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
            passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
            passwordReset.setCreatedAt(now);
            passwordReset.setExpiresAt(now.plusMinutes(45));
            if (passwordReset.getAttemptsRemaining() > 0) {
                passwordReset.setAttemptsRemaining(passwordReset.getAttemptsRemaining() - 1);
            } else {
                LocalDateTime resetTime = passwordReset.getCreatedAt().plusHours(24);
                if (now.isAfter(resetTime)) {
                    passwordReset.setAttemptsRemaining(4);
                } else {
                    // TODO: Reject their request
                    return "";
                }
            }
        } else {
            // Not present in DB need to create entry
            passwordReset = new PasswordReset(email);
            passwordReset.setTokenHash(resetCode);
            passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
            passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
            passwordReset.setAttemptsRemaining(4);
            passwordReset.setCreatedAt(now);
            passwordReset.setExpiresAt(now.plusMinutes(45));
        }

        passwordResetRepository.save(passwordReset);
        return resetCode;
    }

    @Override
    @Transactional
    public void resetPasswordWithOTP(PasswordResetWithOtpDto request, HttpServletRequest httpRequest) {
        // validate password match
        if (!request.passwordsMatch()) {
            throw new PasswordResetDoNotMatchException("Password does not match.");
        }
        // Find the otp record and validate
        PasswordReset passwordResetEntity = accessCodeValidator
                .validate(new ConfirmCodeDTO(request.getEmail(), request.getAccessCode()), httpRequest);
        User user = userService.findByEmail(passwordResetEntity.getEmail());

        // Update password
        user.setPassword(passwordEncoder.encode(request.getPassword1()));
        user.setLastPasswordChangeAt(LocalDateTime.now());
        userService.save(user);

        // Mark OTP as used
        passwordResetEntity.markAsUsed();
        passwordResetRepository.save(passwordResetEntity);

        // Log successful password reset
        // audit the record of change password
        auditService.logEvent(AuditLog.PASSWORD_RESET_COMPLETED, user, httpRequest);
        log.info("Password successfully reset with OTP for user: {}", user.getEmail());

    }

    public String generatePasswordResetCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
