package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Reset_password;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetException;
import com.fdmgroup.SmartPay_BackEnd.repositories.ResetPasswordRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PasswordResetServiceImpl implements PasswordResetService {

    ResetPasswordRepository resetPasswordRepository;
    AuditService auditService;

    public PasswordResetServiceImpl(ResetPasswordRepository resetPasswordRepository,
                                    AuditService auditService){
        this.resetPasswordRepository = resetPasswordRepository;
        this.auditService = auditService;
    }

    @Override
    public void resetPasswordWithOTP(PasswordResetWithOtpDto request, HttpServletRequest httpRequest) {
        // validate password match
        if(!request.passwordsMatch()){
            throw new PasswordResetException("Password does not match.");
        }

        // Hash the code to look it up
        String codeHash = hashCode(request.getCode());

        // Find the otp record
        Reset_password otp = resetPasswordRepository.findByTokenHashAndType(codeHash, Reset_password.TokenType.PASSWORD_RESET)
                .orElseThrow(() -> new InvalidTokenException(
                        "Invalid or expired reset code. Please request a new code."
                ));

        // user contain user id need to fetch user with userRepository
        User user = otp.getUser();

        // Verify email matches
        if (!user.getEmail().equals(request.getEmail())) {
            throw new InvalidTokenException("Invalid reset code for this email address.");
        }

        // Check if OTP is expired
        if (otp.isExpired()) {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("reason", "expired");
            auditService.logEvent(AuditLog.PASSWORD_RESET_FAILED_EXPIRED, user, eventData, httpRequest);

            throw new InvalidTokenException(
                    "This reset code has expired. Please request a new code."
            );
        }

        // Check if OTP is already used
        // Check if OTP has attempts remaining
        // Update password

        // Mark OTP as used
        // Log successful password reset

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
}
