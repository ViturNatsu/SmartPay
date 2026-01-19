package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.repositories.LockedAccountRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PasswordResetService {
	private static final Pattern VALID_EMAIL_REGEX = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
	
	private EmailService emailService;
	
	public HttpStatus startResetRequest(String email) {
		if (!validateEmailFormat(email))
			return HttpStatus.BAD_REQUEST;
		
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
	
	public boolean validateEmailFormat(String email) {
		return VALID_EMAIL_REGEX.matcher(email).matches();
	}
}
