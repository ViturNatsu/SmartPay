package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.LockedAccountService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import lombok.AllArgsConstructor;
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
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
    private AuditService            auditService;
    private AccessCodeValidator     accessCodeValidator;
    private EmailService 			emailService;
    private LockedAccountService	lockedAccountService;
    private UserService				userService;
    private PasswordResetRepository passwordResetRepository;
    private PasswordEncoder         passwordEncoder;

    public HttpStatus startResetRequest(String email) {
    	try { // Make sure a user actually exists before attempting any reset request logic.
    		User user = userService.findUserByEmail(email);
    	} catch (UserNotFoundException e) {
    		System.out.println(e.getMessage());
    		return HttpStatus.ACCEPTED;
    	}
    	
    	Optional<LockedAccount> lockedAccount = lockedAccountService.findLatestLockEntry(email);
    	if (lockedAccount.isPresent()) {
    		LockedAccount account = lockedAccount.get();
    		
    		// Get the current time and subtract 24 hours from it.
    		Calendar calendar = Calendar.getInstance();
    		calendar.add(Calendar.HOUR_OF_DAY, -24);
    		
    		// Check if the account's locked at date is AFTER the date above (This means it's still within
    		// the 24 hour locking period). If so, return a 429 code. Otherwise, continue to the code below.
    		if (account.getLockedAt().after(calendar.getTime()))
    			return HttpStatus.TOO_MANY_REQUESTS;
    	}
    	
    	if (checkPasswordAttemptsRemaining(email) == 0) {
    		LockedAccount newLockedAccount = new LockedAccount(email, new Date());
    		lockedAccountService.AddLockedAccount(newLockedAccount);
    		return HttpStatus.TOO_MANY_REQUESTS;
    	}
    	
        String	resetCode	= createPasswordResetCode(email);
        String	resetUrl	= "http://localhost:5173/verify-email"; // TODO CHANGE FOR DEPLOYMENT
        String 	msgBody 	= "--- PASSWORD RESET --- \n\n" +
                "A password change was requested for your SmartPay account.\n\n" +
                "Here is your password reset code: " + resetCode + "\n\n" +
                "If this was you, follow the link below to reset your password:\n\n" +

                resetUrl +

                "\n\n" +
                "This link and code will expire in 45 minutes.\n\n" +
                "If you did not request this change, you can safely ignore this email.\n\n" +
                "Thank you,\n" +
                "The SmartPay Support Team";

        emailService.sendSimpleMail(new EmailDetails(email, msgBody, "Reset your Password"));
        return HttpStatus.ACCEPTED;
    }

    // Generates/Updates entry in PASSWORD_RESET table. Returns raw code on success or empty string on fail
    public String createPasswordResetCode(String email) {
        PasswordReset passwordReset;
        Optional<PasswordReset> passwordResetOpt = passwordResetRepository.findByEmail(email);
        LocalDateTime now = LocalDateTime.now();
        String resetCodeRaw = generatePasswordResetCode();
        String resetCodeHashed = passwordEncoder.encode(resetCodeRaw);
        if(passwordResetOpt.isPresent()){
            passwordReset = passwordResetOpt.get();
            LocalDateTime resetTime = passwordReset.getCreatedAt().plusHours(24);
            if(now.isAfter(resetTime)) {
                passwordReset.setAttemptsRemaining(4);
                passwordReset.setTokenHash(resetCodeHashed);
                passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
                passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
                passwordReset.setCreatedAt(now);
                passwordReset.setExpiresAt(now.plusMinutes(45));
            } else if(passwordReset.getAttemptsRemaining() > 0) {
                passwordReset.setTokenHash(resetCodeHashed);
                passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
                passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
                passwordReset.setCreatedAt(now);
                passwordReset.setExpiresAt(now.plusMinutes(45));
                passwordReset.setAttemptsRemaining(passwordReset.getAttemptsRemaining() - 1);
            } else {
                return "";
            }
        } else {
            // Not present in DB need to create entry
            passwordReset = new PasswordReset(email);
            passwordReset.setTokenHash(resetCodeHashed);
            passwordReset.setType(PasswordReset.PasswordResetType.PASSWORD_RESET);
            passwordReset.setStatus(PasswordReset.PasswordResetStatus.ACTIVE);
            passwordReset.setAttemptsRemaining(4);
            passwordReset.setCreatedAt(now);
            passwordReset.setExpiresAt(now.plusMinutes(45));
        }
        passwordResetRepository.save(passwordReset);
        return resetCodeRaw;
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
        User user = userService.findUserByEmail(passwordResetEntity.getEmail());

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

    public int checkPasswordAttemptsRemaining(String email) {
        PasswordReset passwordReset;
        Optional<PasswordReset> passwordResetOpt = passwordResetRepository.findByEmail(email);
        if(passwordResetOpt.isPresent()){
            passwordReset = passwordResetOpt.get();
            return passwordReset.getAttemptsRemaining();
        } else {
            // Not present in DB
            return -1;
        }
    }

}
