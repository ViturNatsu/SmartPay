package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "token_hash", nullable = false)
    private String tokenHash;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private String type;

    @Column(name = "attempts_remaining")
    int attemptsRemaining;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
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

}


