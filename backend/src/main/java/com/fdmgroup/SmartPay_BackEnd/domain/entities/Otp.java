package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.EmailDetails;

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
            case FORGOT_PASSWORD ->
                5;
            case REGISTER ->
                3;
            case LOGIN ->
                10;
        };
    }

    public int getOTPVerificationAttemptsLimit() {
        return 5;
    }

    public int getExpiry() {
        return switch (this.otpType) {
            case FORGOT_PASSWORD ->
                45;
            case REGISTER ->
                15;
            case LOGIN ->
                5;
        };
    }

    // @Value("${app.frontend.url:http://localhost:5173}")
    private static String frontendUrl = "http://localhost:5173";

    public EmailDetails getSendCodeEmailTemplate(String code) {
        EmailDetails emailDetails = new EmailDetails();

        emailDetails.setRecipient(email);
        emailDetails.setSubject(switch (this.otpType) {
            case LOGIN ->
                "Your SmartPay sign-in code";
            case REGISTER ->
                "Verify your SmartPay account";
            case FORGOT_PASSWORD ->
                "Reset your SmartPay password";
        });
        String template = """
                We received a request to log into your SmartPay account.

                If this was you, click the link below to verify your action:

                %s/verify?email=%s&type=%s&code=%s
                """;
        emailDetails.setMsgBody(switch (this.otpType) {
            case LOGIN ->
                template.formatted(frontendUrl, this.email, "login", code);
            case REGISTER ->
                template.formatted(frontendUrl, this.email, "register", code);
            case FORGOT_PASSWORD ->
                template.formatted(frontendUrl, this.email, "forgot-password", code);
        }
                + "\nYour verification code is: " + code + "\n\n"
                + "This code expires in " + this.getExpiry() + " minutes.\n\n"
                + "If you did not request this, you can safely ignore this email.\n\n"
                + "Thank you,\n"
                + "The SmartPay Support Team");

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
