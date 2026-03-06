package com.fdmgroup.SmartPay_BackEnd.services.system;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.system.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.system.AuditLogRepository;
import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {
    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(EventType eventType, String eventStatus, User user, Map<String, Object> eventData,
            HttpServletRequest request) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .eventType(eventType)
                    .eventStatus(eventStatus)
                    .user(user)
                    .eventData(eventData != null ? eventData : new HashMap<>())
                    .ipAddress(getClientIp(request))
                    .userAgent(request != null ? request.getHeader("User-Agent") : null)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit event logged: {} [{}] for user: {}", eventType, eventStatus,
                    user != null ? user.getEmail() : "unknown");
        } catch (Exception e) {
            log.error("Failed to log audit event: {}", eventType, e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(EventType eventType, String eventStatus, User user, HttpServletRequest request) {
        logEvent(eventType, eventStatus, user, new HashMap<>(), request);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null)
            return "system";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip != null && ip.contains(",") ? ip.split(",")[0].trim() : ip;
    }
}
