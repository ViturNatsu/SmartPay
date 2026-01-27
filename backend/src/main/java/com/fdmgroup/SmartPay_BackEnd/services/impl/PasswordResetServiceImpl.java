package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.LockedAccountService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private AuditService auditService;
    private AccessCodeValidator accessCodeValidator;
    private EmailService emailService;
    private LockedAccountService lockedAccountService;
    private UserService userService;
    private OtpService otpService;
    private PasswordEncoder passwordEncoder;

    public HttpStatus startResetRequest(String email) {
        // Make sure user exists before attempting reset request logic.
        try {
            userService.findByEmail(email);
        } catch (UserNotFoundException e) {
            System.out.println(e.getMessage());
            return HttpStatus.ACCEPTED;
        }

        // Check if account is locked
        Optional<LockedAccount> lockedAccount = lockedAccountService.findLatestLockEntry(email);
        if (lockedAccount.isPresent()) {
            LockedAccount account = lockedAccount.get();

            // Get the current time and subtract 24 hours from it.
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.HOUR_OF_DAY, -24);

            // Check if the account's locked at date is AFTER the date above (This means
            // it's still within
            // the 24 hour locking period). If so, return a 429 code. Otherwise, continue to
            // the code below.
            if (account.getLockedAt().after(calendar.getTime()))
                return HttpStatus.TOO_MANY_REQUESTS;
        }

        Otp otp;
        Optional<Otp> otpOpt = otpService.findByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        String resetCodeRaw = generatePasswordResetCode();
        String resetCodeHashed = passwordEncoder.encode(resetCodeRaw);

        if (otpOpt.isPresent()) {
            otp = otpOpt.get();
            LocalDateTime resetTime = otp.getFirstRequestAt().plusHours(24);
            if (now.isAfter(resetTime)) {
                otp.setOtpHash(resetCodeHashed);
                otp.setAttemptsMade(0);
                otp.setStatus(OtpStatus.ACTIVE);
                otp.setFirstRequestAt(now);
                otp.setExpiresAt(now.plusMinutes(45));
            } else if (otp.getAttemptsMade() < 5) {
                otp.setOtpHash(resetCodeHashed);
                otp.setAttemptsMade(otp.getAttemptsMade() + 1);
                otp.setStatus(OtpStatus.ACTIVE);
                otp.setExpiresAt(now.plusMinutes(45));
            } else {
                LockedAccount newLockedAccount = new LockedAccount(email, new Date());
                lockedAccountService.AddLockedAccount(newLockedAccount);
                return HttpStatus.TOO_MANY_REQUESTS;
            }
            
            otpService.updateOtp(otp);
        } else {
            // Not present in DB need to create entry
            otp = new Otp(email);
            otp.setOtpHash(resetCodeHashed);
            otp.setAttemptsMade(0);
            otp.setOtpType(OtpType.FORGOT_PASSWORD);
            otp.setStatus(OtpStatus.ACTIVE);
            otp.setFirstRequestAt(now);
            otp.setExpiresAt(now.plusMinutes(45));
            
            otpService.createOtp(otp);
        }

        EmailDetails emailDetails = new EmailDetails();

        emailDetails.setRecipient(email);
        emailDetails.setSubject("Reset your Password");

        String resetCode = resetCodeRaw;
        String resetUrl = String.format("http://localhost:5173/verify?email=%s&type=%s&code=%s", 
        		email, "forgot-password", resetCode); // TODO CHANGE FOR DEPLOYMENT
        emailDetails.setMsgBody("--- PASSWORD RESET --- \n\n" +
                "A password change was requested for your SmartPay account.\n\n" +
                "If this was you, click the link below to reset your password:\n\n" +

                resetUrl +

                "\n\n" +
                "This link will expire in 45 minutes.\n\n" +
                "If you did not request this change, you can safely ignore this email.\n\n" +
                "Thank you,\n" +
                "The SmartPay Support Team");

        emailService.sendSimpleMail(emailDetails);
        return HttpStatus.ACCEPTED;
    }

    @Override
    @Transactional
    public void resetPasswordWithOTP(PasswordResetWithOtpDto request, HttpServletRequest httpRequest) {
        // validate password match
        if (!request.passwordsMatch()) {
            throw new PasswordResetDoNotMatchException("Password does not match.");
        }
        // Find the otp record and validate
        Otp otpEntity = accessCodeValidator
                .validate(new OtpDTO(request.getEmail(), request.getAccessCode(), OtpType.FORGOT_PASSWORD),
                        httpRequest);
        User user = userService.findByEmail(otpEntity.getEmail());

        // Update password
        user.setPassword(passwordEncoder.encode(request.getPassword1()));
        user.setLastPasswordChangeAt(LocalDateTime.now());
        userService.save(user);

        // Mark OTP as used
        otpEntity.markAsUsed();
        otpService.updateOtp(otpEntity);

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
