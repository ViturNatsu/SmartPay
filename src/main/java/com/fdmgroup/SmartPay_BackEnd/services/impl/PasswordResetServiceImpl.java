package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    PasswordResetRepository passwordResetRepository;
    AuditService auditService;
    private EmailService emailService;
    private PasswordResetService passwordResetService;
    private PasswordResetRepository passwordResetRepository;

    @Autowired
    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository) {
        this.passwordResetRepository = passwordResetRepository;
    }

    public PasswordResetServiceImpl(PasswordResetRepository passwordResetRepository,
                                    AuditService auditService){
        this.passwordResetRepository = passwordResetRepository;
        this.auditService = auditService;
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
                    return "";
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
        return resetCode;
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
        PasswordReset otp = passwordResetRepository.findByTokenHashAndType(codeHash, PasswordReset.TokenType.PASSWORD_RESET)
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

    public String generatePasswordResetCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
