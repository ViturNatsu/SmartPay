package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "OTP")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Otp {
	
	public Otp(String email, OtpType type) {
		this.email = email;
		this.otpType = type;
	}

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "otp_id", updatable = false, nullable = false)
    private UUID otpId;

    @Column(name = "user_email")
    private String email;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OtpStatus status;

    @Column(name = "otp_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private OtpType otpType;

    @Column(name = "attempts_made")
    int attemptsMade;

    @Column(name = "first_request_at")
    private LocalDateTime firstRequestAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    public String getEmail() {
		return this.email.toLowerCase();
	}
    
    public enum OtpType {
        FORGOT_PASSWORD,
        REGISTER,
        LOGIN
    }

    public enum OtpStatus {
        ACTIVE,
        EXPIRED,
        LOCKED,
        USED
    }
    
    public int getLimit() {
    	return switch (this.otpType) {
	        case FORGOT_PASSWORD -> 5;
	        case REGISTER -> 3;
	        case LOGIN -> 10;
	    };
    }
    
    public int getExpiry() {
    	return switch (this.otpType) {
	        case FORGOT_PASSWORD -> 45;
	        case REGISTER -> 15;
	        case LOGIN -> 5;
	    };
    }
    
    public EmailDetails getSendCodeEmailTemplate(String code) {
    	EmailDetails emailDetails = new EmailDetails();
        emailDetails.setRecipient(email);
        emailDetails.setSubject(switch (this.otpType) {
        	case LOGIN -> "Your SmartPay sign-in code";
	        case REGISTER -> "Verify your SmartPay account";
	        case FORGOT_PASSWORD -> "Reset your SmartPay password";
	    });
        
        emailDetails.setMsgBody(switch (this.otpType) {
	        case LOGIN, REGISTER -> 
	        	"Your verification code is: " + code + "\n\n" +
                "This code expires in " +this.getExpiry() + " minutes.\n\n" +
                "If you did not request this, you can ignore this email.";
	        case FORGOT_PASSWORD -> 
	        	"A password change was requested for your SmartPay account.\n\n" +
                "If this was you, click the link below to reset your password:\n\n" +
                String.format("http://localhost:5173/verify?email=%s&type=%s&code=%s", 
                        email, "forgot-password", code) +
                "\n\n" +
                "This code expires in " + this.getExpiry() + " minutes.\n\n" +
                "If you did not request this change, you can safely ignore this email.\n\n" +
                "Thank you,\n" +
                "The SmartPay Support Team";
        });
        
        return emailDetails;
    }
    
    public EmailDetails getAccountLockedEmailTemplate() {
    	EmailDetails emailDetails = new EmailDetails();
        emailDetails.setRecipient(email);
        emailDetails.setSubject("SmartPay - Security Alert");
        
        emailDetails.setMsgBody("There have been multiple failed login attempts on your account, "
        		+ "and it has been locked as a result. Please reach out to customer service to resolve this issue.");
        
        return emailDetails;
    }
    
    public boolean isActive() {
        return status == OtpStatus.ACTIVE && !isExpired();
    }

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isLocked() {
        return status == OtpStatus.LOCKED;
    }

    public boolean isUsed() {
        return status == OtpStatus.USED;
    }

    public void markAsUsed() {
        if (!isActive()) {
            throw new IllegalStateException("Password reset token is not active");
        }
        this.status = OtpStatus.USED;
    }
}
