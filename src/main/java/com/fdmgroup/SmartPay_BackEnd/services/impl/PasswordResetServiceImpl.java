package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    PasswordResetRepository passwordResetRepository;
    AuditService auditService;
    private EmailService emailService;
    UserRepository userRepository;

    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository,
                                    AuditService auditService, EmailService emailService,
                                    UserRepository userRepository){
        this.passwordResetRepository = passwordResetRepository;
        this.auditService = auditService;
        this.emailService = emailService;
        this.userRepository = userRepository;
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
    public String createPasswordResetCode(String email) {
        //passwordResetRepository.findByEmail(email);
        PasswordReset passwordReset;
        Optional<PasswordReset> passwordResetOpt = passwordResetRepository.findByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        String resetCode = generatePasswordResetCode();
        if(passwordResetOpt.isPresent()){
            passwordReset = passwordResetOpt.get();

            passwordReset.setTokenHash(resetCode);
            passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
            passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
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
    public void resetPasswordWithOTP(PasswordResetWithOtpDto request, HttpServletRequest httpRequest) {
        // validate password match
        if(!request.passwordsMatch()){
            throw new PasswordResetException("Password does not match.");
        }

        // Hash the code to look it up
        //need impl
        String codeHash = hashCode(request.getCode());

        // Find the otp record
        PasswordReset otp = passwordResetRepository.findByTokenHashAndType(codeHash, PasswordReset.PasswordResetType.PASSWORD_RESET)
                .orElseThrow(() -> new InvalidTokenException(
                        "Invalid or expired reset code. Please request a new code."
                ));

        String email = otp.getEmail();
        User user = otp.getUser();

        // Verify email matches
        if (email.equals(request.getEmail())) {
            throw new InvalidTokenException("Invalid reset code for this email address.");
        }

        // Check if OTP is expired
        if (otp.isExpired()) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "expired");
            auditService.logEvent(AuditLog.PASSWORD_RESET_FAILED_EXPIRED, user, eventData, httpRequest);

            throw new InvalidTokenException(
                    "This password reset link has expired or has already been used. Please request a new password reset link"
            );
        }

        // Check if OTP is already used
        if (otp.isUsed()) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "already_used");
            auditService.logEvent(AuditLog.PASSWORD_RESET_FAILED_USED, user, eventData, httpRequest);

            throw new InvalidTokenException(
                    "This password reset link has expired or has already been used. Please request a new password reset link"
            );
        }
        // Check if OTP has attempts remaining
        if (otp.getAttemptsRemaining() <= 0) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "no_attempts_remaining");
            auditService.logEvent(AuditLog.INVALID_RESET_CODE, user, eventData, httpRequest);

            throw new InvalidTokenException(
                    "We can’t process this request right now. Please try again later"
            );
        }
        // Update password
        // need encoding impl
        user.setPassword(request.getNewPassword());
        user.setLastPasswordChangeAt(LocalDateTime.now());
        userRepository.save(user);

        // Mark OTP as used
        otp.markAsUsed();
        passwordResetRepository.save(otp);

        // Log successful password reset
        // audit the record of change password
        auditService.logEvent(AuditLog.PASSWORD_RESET_COMPLETED, user, httpRequest);
        log.info("Password successfully reset with OTP for user: {}", user.getEmail());

    }

    private String hashCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(code.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing code", e);
        }
    }

    public String generatePasswordResetCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
