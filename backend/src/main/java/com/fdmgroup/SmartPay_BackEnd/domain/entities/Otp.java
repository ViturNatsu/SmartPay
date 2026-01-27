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
import jakarta.persistence.PrePersist;
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

    @PrePersist
    public void onCreate() {
        this.firstRequestAt = LocalDateTime.now();
        this.status = OtpStatus.ACTIVE;
    }

    public Otp(String email) {
        this.email = email;
    }

    public enum OtpType {
        FORGOT_PASSWORD,
        LOGIN,
        REGISTER
    }

    public enum OtpStatus {
        ACTIVE,
        EXPIRED,
        LOCKED,
        USED
    }
}
