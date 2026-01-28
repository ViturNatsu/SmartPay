package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpFlowService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpFlowServiceImpl implements OtpFlowService {

    private static final int OTP_EXPIRY_MINUTES = 10;

    private final OtpService otpService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public HttpStatus requestOtp(String email, OtpType type) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();

        // Ensure user exists for flows that require an account
        User user = userService.findByEmail(normalizedEmail);

        String rawCode = generateOtpCode();
        String hashed = passwordEncoder.encode(rawCode);
        LocalDateTime now = LocalDateTime.now();

        Optional<Otp> existingOpt = otpService.findByEmailAndType(normalizedEmail, type);
        Otp otp;
        if (existingOpt.isPresent()) {
            otp = existingOpt.get();
            otp.setOtpHash(hashed);
            otp.setStatus(OtpStatus.ACTIVE);
            otp.setAttemptsMade(0);
            otp.setFirstRequestAt(now);
            otp.setExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
            otpService.updateOtp(otp);
        } else {
            otp = new Otp(normalizedEmail);
            otp.setOtpHash(hashed);
            otp.setAttemptsMade(0);
            otp.setOtpType(type);
            otp.setStatus(OtpStatus.ACTIVE);
            otp.setFirstRequestAt(now);
            otp.setExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
            otpService.createOtp(otp);
        }

        EmailDetails details = new EmailDetails();
        details.setRecipient(normalizedEmail);
        details.setSubject(switch (type) {
            case LOGIN -> "Your SmartPay sign-in code";
            case REGISTER -> "Verify your SmartPay account";
            case FORGOT_PASSWORD -> "Reset your SmartPay password";
        });

        // NOTE: for convenience in dev, include the code in the email body.
        details.setMsgBody("Your verification code is: " + rawCode + "\n\n" +
                "This code expires in " + OTP_EXPIRY_MINUTES + " minutes.\n\n" +
                "If you did not request this, you can ignore this email.");

        emailService.sendSimpleMail(details);

        // For login/register we don't expose whether the account exists; for now, keep it simple.
        return HttpStatus.ACCEPTED;
    }

    private String generateOtpCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }
}
