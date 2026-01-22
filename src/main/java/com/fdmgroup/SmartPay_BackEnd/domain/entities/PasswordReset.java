package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "otp")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordReset {
    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "reset_id", updatable = false, nullable = false)
    private UUID reset_id;

    @Column(unique = true, name = "user_email")
    private String email;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PasswordResetType type;

    @Column(name = "attempts_remaining")
    int attemptsRemaining;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private PasswordResetStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isUsed() {
        return status == PasswordResetStatus.USED;
    }

    public boolean isActive() {
        return status == PasswordResetStatus.ACTIVE && !isExpired();
    }

    public void markAsUsed() {
        if (!isActive()) {
            throw new IllegalStateException("Password reset token is not active");
        }
        this.status = PasswordResetStatus.USED;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.status = PasswordResetStatus.ACTIVE;
    }

    @Override
    public String toString() {
        return "PasswordReset{" +
                "reset_id=" + reset_id +
                ", email='" + email + '\'' +
                ", tokenHash='" + tokenHash + '\'' +
                ", type='" + type + '\'' +
                ", attemptsRemaining=" + attemptsRemaining +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", expiresAt=" + expiresAt +
                '}';
    }
    public PasswordReset(String email) {
        this.email = email;
    }

    public enum PasswordResetType {
        PASSWORD_RESET,
        EMAIL_VERIFICATION,
        ACCOUNT_RECOVERY
    }
    public enum PasswordResetStatus {
        ACTIVE,
        USED,
        EXPIRED,
        LOCKED
    }
}


