package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import org.springframework.stereotype.Service;


import lombok.AllArgsConstructor;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {
	
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

    // Generates a 7 digit password reset code
    // TODO: Add hashing to encrypt the reset code
    public void createPasswordResetCode(PasswordReset passwordReset) {
        if(passwordReset.getAttemptsRemaining() > 0){
            passwordReset.setAttemptsRemaining(passwordReset.getAttemptsRemaining() - 1);
            //TODO: Work
            String resetCode = generatePasswordResetCode();

        } else {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime resetTime = passwordReset.getCreatedAt().plusHours(24);
            if(now.isAfter(resetTime)){
                passwordReset.setAttemptsRemaining(4);
                //TODO: Work
            }
            else{
                // REJECT
            }
        }

    }

    public String generatePasswordResetCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(10_000_000);
        return String.format("%07d", code);
    }

}
