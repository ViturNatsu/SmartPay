package com.fdmgroup.SmartPay_BackEnd.domain.entities.system;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(generator = "UUID")
    @Column(name = "log_id", updatable = false, nullable = false)
    private UUID logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "event_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Column(name = "event_status", nullable = false)
    private String eventStatus;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "event_data", columnDefinition = "text") // change columnDefinition = "jsonb" for production postgres
    private Map<String, Object> eventData;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Audit event statuses
    public static final String PASSWORD_RESET_REQUESTED = "PASSWORD_RESET_REQUESTED";
    public static final String PASSWORD_RESET_COMPLETED = "PASSWORD_RESET_COMPLETED";
    public static final String PASSWORD_RESET_FAILED_EXPIRED = "PASSWORD_RESET_FAILED_EXPIRED";
    public static final String PASSWORD_RESET_FAILED_USED = "PASSWORD_RESET_FAILED_USED";
    public static final String PASSWORD_RESET_EXCESSIVE_ATTEMPTS = "PASSWORD_RESET_EXCESSIVE_ATTEMPTS";
    public static final String OTP_REQUEST_GENERATED = "OTP_REQUEST_GENERATED";
    public static final String OTP_REQUEST_DENIED = "OTP_REQUEST_DENIED";
    public static final String OTP_VERIFICATION_PASSED = "OTP_VERIFICATION_PASSED";
    public static final String OTP_VERIFICATION_FAILED = "OTP_VERIFICATION_FAILED";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String INVALID_RESET_CODE = "INVALID_RESET_CODE";
}