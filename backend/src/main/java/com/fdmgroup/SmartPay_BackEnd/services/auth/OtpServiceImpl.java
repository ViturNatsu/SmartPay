package com.fdmgroup.SmartPay_BackEnd.services.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationTier;
import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.system.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeInvalidatedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.EmailAlreadyVerifiedException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.integration.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.system.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import jakarta.servlet.http.HttpServletRequest;
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
	private AuditService auditService;
	private final EmailService emailService;
    private final NotificationService notificationService;

	@Override
	public Optional<Otp> findByEmailAndOtpType(String email, EventType otpType) {
		return otpRepository.findByEmailAndOtpType(email, otpType);
	}

	@Override
	public Optional<Otp> findBrequestOtpyEmailAndOtpType(String email, EventType otpType) {
		return Optional.empty();
	}

	@Override
	@Transactional
	public Otp save(Otp otp) {
		return otpRepository.save(otp);
	}

	@Override
	@Transactional(dontRollbackOn = AccountLockedException.class)
	public HttpStatus requestOtp(String email, EventType type, HttpServletRequest httpRequest) {
		Map<String, Object> eventData = new HashMap<>();

		try {
			// Make sure user exists before attempting reset request logic.
			User user = userService.findByEmail(email);

			if (type == EventType.REGISTER && user.isEmailVerified()) {
				eventData.put("reason", "AlreadyVerified");
				auditService.logEvent(type, AuditLog.OTP_REQUEST_DENIED, user, eventData, httpRequest);
				throw new EmailAlreadyVerifiedException("Email is already verified. Please log in.");
			}

			Otp otp = findByEmailAndOtpType(email, type).orElse(new Otp(email, type));
			LocalDateTime now = LocalDateTime.now();

			if (otp.getFirstRequestAt() != null && now.isBefore(otp.getFirstRequestAt().plusHours(24))) {
				if (otp.isLocked()) {
					log.info("Request denied for locked account: {}", email);
					eventData.put("reason", "Locked");
					auditService.logEvent(type, AuditLog.OTP_REQUEST_DENIED, user, eventData, httpRequest);
					throw new AccountLockedException("Account is temporarily locked due to multiple attempts.");
				}

				if (otp.getAttemptsMade() >= otp.getLimit()) {
					otp.setStatus(OtpStatus.LOCKED);
					otp.setFirstRequestAt(now);
					otpRepository.save(otp);
					emailService.sendSimpleMail(otp.getAccountLockedEmailTemplate());
					eventData.put("reason", "Locked");
					auditService.logEvent(type, AuditLog.OTP_REQUEST_DENIED, user, eventData, httpRequest);
					throw new AccountLockedException("Account is temporarily locked due to multiple attempts.");
				}
			}


			String rawCode = generateCode();
			String hashedCode = argonPasswordEncoder.encode(rawCode);

			// if otp was just created, or it's past the reset time, reset the otp
			if (otp.getFirstRequestAt() == null
					|| now.isAfter(otp.getFirstRequestAt().plusHours(24))) {
				otp.setFirstRequestAt(now);
				otp.setAttemptsMade(0);
			}

			otp.setOtpHash(hashedCode);
			otp.setAttemptsMade(otp.getAttemptsMade() + 1);
			otp.setAttemptsPerOtp(0);
			otp.setStatus(OtpStatus.ACTIVE);
			otp.setExpiresAt(now.plusMinutes(otp.getExpiry()));

			otpRepository.save(otp);
			eventData.put("reason", "Generated");
			auditService.logEvent(type, AuditLog.OTP_REQUEST_GENERATED, user, eventData, httpRequest);

			emailService.sendSimpleMail(otp.getSendCodeEmailTemplate(rawCode));
			return HttpStatus.ACCEPTED;
		} catch (UserNotFoundException e) {
			return HttpStatus.ACCEPTED;
		}
	}

	@Override
	public Otp verifyOtp(OtpDTO payload, HttpServletRequest httpRequest) {
		Otp otpRequest = otpRepository.findByEmailAndOtpType(payload.getEmail(), payload.getType())
				.orElseThrow(() -> new EmailNotFoundException("No OTP found for the provided email address."));

		User user = userService.findByEmail(payload.getEmail());
		Map<String, Object> eventData = new HashMap<>();

		try {
			// Check if OTP is expired due to too many verification attempts
			if (otpRequest.getAttemptsPerOtp() >= otpRequest.getOTPVerificationAttemptsLimit()) {
				otpRequest.setStatus(OtpStatus.EXPIRED);
				otpRepository.save(otpRequest);
				eventData.put("reason", "Invalidated");
				throw new AccessCodeInvalidatedException(
						"The code has been invalidated due to multiple failed attempts. Please request a new code.");
			}

			// Check if account is locked
			if (otpRequest.isLocked()) {
				eventData.put("reason", "Locked");
				throw new AccountLockedException(
						"We can't process this request right now. Account has been locked for too many attempts. Please try again later");
			}

			// Check if OTP is expired
			if (otpRequest.isExpired()) {
				eventData.put("reason", "Expired");
				throw new AccessCodeExpiredException(
						"This code has expired or has already been used. Please request a new code");
			}

			// Check if OTP is already used
			if (otpRequest.isUsed()) {
				eventData.put("reason", "Used");
				throw new AccessCodeUsedException(
						"This code has expired or has already been used. Please request a new code");
			}

			// Validate OTP code
			if (!argonPasswordEncoder.matches(payload.getCode(), otpRequest.getOtpHash())) {
				otpRequest.setAttemptsPerOtp(otpRequest.getAttemptsPerOtp() + 1);
				otpRepository.save(otpRequest);
				eventData.put("reason", "Mismatch");
				throw new AccessCodeMismatchException("This code is invalid. Please verify the code and try again.");
			}
		} catch (Exception e) {
			auditService.logEvent(payload.getType(), AuditLog.OTP_VERIFICATION_FAILED, user, eventData, httpRequest);
			throw e;
		}
		otpRequest.setAttemptsMade(0);
		otpRequest.setAttemptsPerOtp(0);
		otpRepository.save(otpRequest);

		eventData.put("reason", "Verified");

        //create sign-in notification
		UUID auditLogId = auditService.logEvent(payload.getType(), AuditLog.OTP_VERIFICATION_PASSED, user, eventData, httpRequest);
        if (payload.getType() == EventType.LOGIN && auditLogId != null) {
            NotificationCreateRequestDTO signInNotification = new NotificationCreateRequestDTO();
            signInNotification.setUserId(user.getId());
            signInNotification.setType(NotificationType.SECURITY);
            signInNotification.setTitle("New sign-in detected");
            signInNotification.setTier(NotificationTier.T2.getValue());
            signInNotification.setRelatedEntityType("AUDIT_LOG");
            signInNotification.setRelatedEntityId(auditLogId.toString());
            notificationService.createNotification(signInNotification);
        }

        return otpRequest;
	}

	public String generateCode() {
		SecureRandom random = new SecureRandom();
		int code = random.nextInt(10_000_000);
		return String.format("%07d", code);
	}

}
