package com.fdmgroup.SmartPay_BackEnd.domain.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PasswordReset {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "reset_id")
    private long id;

    @Column(unique = true, name = "user_email")
    private String email;

    @Column(name = "token_hash")
    private String tokenHash;

    @Column(name = "type")
    private String type;

    @Column(name = "attempts_remaining")
    int attemptsRemaining;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name="expires_at")
    private LocalDateTime expiresAt;

    @Override
    public String toString() {
        return "PasswordReset{" +
                "id=" + id +
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
