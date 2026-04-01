package com.fdmgroup.SmartPay_BackEnd.domain.entities.auth;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 500)
    private String refreshToken;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime lastUsedAt;

    @Column(nullable = false)
    private Integer sessionTimeoutMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    /**
     * Checks if this session has expired based on inactivity
     */
    public boolean isExpired() {
        LocalDateTime expiryTime = lastUsedAt.plusMinutes(sessionTimeoutMinutes);
        return LocalDateTime.now().isAfter(expiryTime);
    }

    /**
     * Updates the last used timestamp to now
     */
    public void updateLastUsed() {
        this.lastUsedAt = LocalDateTime.now();
    }
}
