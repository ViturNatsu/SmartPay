package com.fdmgroup.SmartPay_BackEnd.domain.entities.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration.EmailDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
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

    public Otp(String email, EventType type) {
        this.email = email;
        this.otpType = type;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "otp_id", updatable = false, nullable = false)
    private UUID otpId;

    @Email(message = "Please enter a valid email address.")
    @Column(name = "user_email", nullable = false)
    private String email;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private OtpStatus status;

    @Column(name = "otp_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType otpType;

    @Column(name = "attempts_made")
    int attemptsMade;

    @Column(name = "attempts_per_OTP")
    int attemptsPerOtp;

    @Column(name = "first_request_at")
    private LocalDateTime firstRequestAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    public String getEmail() {
        return this.email.toLowerCase();
    }

    public enum OtpStatus {
        ACTIVE,
        EXPIRED,
        LOCKED,
        USED;

    }

    public int getLimit() {
        return switch (this.otpType) {
            case FORGOT_PASSWORD, CARD_LOCK, CARD_UNLOCK, REVEAL_CARD -> 5;
            case REGISTER -> 3;
            case LOGIN -> 10;
            default -> throw new IllegalStateException("No OTP limit for type: " + this.otpType);
        };
    }

    public int getOTPVerificationAttemptsLimit() {
        return 5;
    }

    public int getExpiry() {
        return switch (this.otpType) {
            case FORGOT_PASSWORD -> 45;
            case REGISTER -> 15;
            case LOGIN -> 5;
            case REVEAL_CARD -> 5;
            case CARD_LOCK, CARD_UNLOCK -> 10;
            default -> throw new IllegalStateException("No OTP expiry for type: " + this.otpType);
        };
    }

    // @Value("${app.frontend.url:http://localhost:5173}")
    private static String frontendUrl = "http://localhost:5173";

    public EmailDetails getSendCodeEmailTemplate(String code) {
        EmailDetails emailDetails = new EmailDetails();

        emailDetails.setRecipient(email);
        emailDetails.setSubject(switch (this.otpType) {
            case LOGIN -> "Your SmartPay sign-in code";
            case REGISTER -> "Verify your SmartPay account";
            case FORGOT_PASSWORD -> "Reset your SmartPay password";
            case REVEAL_CARD -> "Verify your SmartPay card access";
            case CARD_LOCK -> "Lock your card";
            case CARD_UNLOCK -> "Unlock your card";
            default -> throw new IllegalStateException("No email subject for type: " + this.otpType);
        });
        String template = """
                We received a request on your SmartPay account for %s.

                If this was you, click the link below to verify your action:

                %s/verify?email=%s&type=%s&code=%s
                """;
        emailDetails.setMsgBody(switch (this.otpType) {
            case LOGIN -> template.formatted("Login", frontendUrl, this.email, "login", code);
            case REGISTER -> template.formatted("Email Verification", frontendUrl, this.email, "register", code);
            case FORGOT_PASSWORD ->
                template.formatted("Password Reset", frontendUrl, this.email, "forgot-password", code);
            case REVEAL_CARD ->
                template.formatted("Card Details Access", frontendUrl, this.email, "reveal-card", code);
            case CARD_LOCK -> getCardLockTemplate().formatted("Card Lock", frontendUrl, code, this.otpType);
            case CARD_UNLOCK -> getCardLockTemplate().formatted("Card Unlock", frontendUrl, code, this.otpType);
            default -> throw new IllegalStateException("No email body for type: " + this.otpType);
        }
                + "\nYour verification code is: " + code + "\n\n"
                + "This code expires in " + this.getExpiry() + " minutes.\n\n"
                + "If you did not request this, you can safely ignore this email.\n\n"
                + "Thank you,\n"
                + "The SmartPay Support Team");

        return emailDetails;
    }

    private String getCardLockTemplate() {
        // hacky workaround. Should probably have a template builder if the OTP object remains unified for both authentication and action.
        return  """
                We received a request on your SmartPay account for %s.
                
                If this was you, click the link below to verify your action:

                %s/wallet?code=%s&type=%s
              
                """;
    }

    public EmailDetails getAccountLockedEmailTemplate() {
        EmailDetails emailDetails = new EmailDetails();
        emailDetails.setRecipient(email);
        emailDetails.setSubject("SmartPay - Security Alert");

        emailDetails.setMsgBody("\nThere have been multiple failed "
                + switch (this.otpType) {
                    case LOGIN -> "sign-in";
                    case REGISTER -> "email verification";
                    case FORGOT_PASSWORD -> "password reset";
                    default -> "unknown";
                } +
                " attempts on your account.\n\n"
                + "As a result, this service has been temporarily locked for 24 hours.\n\n"
                + "Please reach out to customer service to resolve this issue.\n\n"
                + "Thank you,\n"
                + "The SmartPay Support Team");

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
