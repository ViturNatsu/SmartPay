package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
public class OtpServiceImpl implements OtpService {

	private OtpRepository otpRepository;
	private UserService userService;
	private PasswordEncoder argonPasswordEncoder;
    private final EmailService emailService;

	@Override
	public Optional<Otp> findByEmailAndOtpType(String email, OtpType otpType) {
		return otpRepository.findByEmailAndOtpType(email, otpType);
	}

	@Override
	@Transactional
	public Otp save(Otp otp) {
		return otpRepository.save(otp);
	}

	@Override
	@Transactional(dontRollbackOn = AccountLockedException.class)
	public HttpStatus requestOtp(String email, OtpType type) {
		 // Make sure user exists before attempting reset request logic.
        try {
            userService.findByEmail(email);
        } catch (UserNotFoundException e) {
            return HttpStatus.ACCEPTED;
        }
        
        Otp otp = findByEmailAndOtpType(email, type).orElse(new Otp(email, type));
		LocalDateTime now = LocalDateTime.now();

        if (otp.getFirstRequestAt() != null && now.isBefore(otp.getFirstRequestAt().plusHours(24))) {
            if (otp.isLocked()) {
                log.info("Request denied for locked account: {}", email);
                throw new AccountLockedException("Account is temporarily locked due to multiple attempts.");
            }

            if (otp.getAttemptsMade() >= otp.getLimit()) {
            	otp.setStatus(OtpStatus.LOCKED);
            	otp.setFirstRequestAt(now);
                otpRepository.save(otp);
                log.info("Account locked due to too many attempts: {}", email);
                throw new AccountLockedException("Account is temporarily locked due to multiple attempts.");
            }
        };

        String rawCode = generateCode();
        String hashedCode = argonPasswordEncoder.encode(rawCode);

		// if otp was just created, or its past the reset time, reset the otp
		if (otp.getFirstRequestAt() == null
				|| now.isAfter(otp.getFirstRequestAt().plusHours(24))) {
			otp.setFirstRequestAt(now);
			otp.setAttemptsMade(0);
		}

		otp.setOtpHash(hashedCode);
		otp.setAttemptsMade(otp.getAttemptsMade() + 1);
		otp.setStatus(OtpStatus.ACTIVE);
		otp.setExpiresAt(now.plusMinutes(otp.getExpiry()));

		otpRepository.save(otp);

        emailService.sendSimpleMail(otp.getEmail(rawCode));
        return HttpStatus.ACCEPTED;
	}

	@Override
	public Otp verifyOtp(OtpDTO payload) {
		Otp otpRequest = otpRepository.findByEmailAndOtpType(payload.getEmail(), payload.getType())
				.orElseThrow(() -> new EmailNotFoundException("No OTP found for the provided email address."));

		// Check if account if locked
		if (otpRequest.isLocked()) {
			throw new AccountLockedException(
					"We can't process this request right now. Account has been locked for too many attempts. Please try again later");
		}

		// Check if OTP has attempts remaining
		if (otpRequest.getAttemptsMade() >= 5) {
			throw new AccountLockedException(
					"We can't process this request right now. Account has been locked for too many attempts. Please try again later");
		}

		// Check if OTP is expired
		if (otpRequest.isExpired()) {
			throw new AccessCodeExpiredException(
					"This code has expired or has already been used. Please request a new code");
		}

		// Check if OTP is already used
		if (otpRequest.isUsed()) {
			throw new AccessCodeUsedException(
					"This code has expired or has already been used. Please request a new code");
		}

		// Validate OTP code
		if (!argonPasswordEncoder.matches(payload.getCode(), otpRequest.getOtpHash())) {
			throw new AccessCodeMismatchException("This code is invalid. Please verify the code and try again.");
		}

		return otpRequest;
	}
	
	public String generateCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
