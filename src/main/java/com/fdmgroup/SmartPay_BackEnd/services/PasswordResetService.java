package com.fdmgroup.SmartPay_BackEnd.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class PasswordResetService {
	
	public String startResetRequest(String email) {
		
		
		// String recipient (email)
		// String msgBody
		// String subject
		String subject = "Reset your Password";
		
//		String msgBody = "--- PASSWORD RESET --- \n\n" +
//			    "A password change was requested for your SmartPay account.\n\n" +
//			    "Here is your password reset code: " + resetCode + "\n\n" +
//			    "If this was you, follow the link below to reset your password:\n\n" +
//			    
//			    resetUrl + 
//			    
//			    "\n\n" +
//			    "This link and code will expire in 40 minutes.\n\n" +
//			    "If you did not request this change, you can safely ignore this email.\n\n" +
//			    "Thank you,\n" +
//			    "The SmartPay Support Team";
		
		return "";
	}

}
