package com.fdmgroup.SmartPay_BackEnd.services.auth;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.system.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.SessionEntity;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.SessionAuthenticationException;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.SessionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.system.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.system.SystemConfigurationService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepo;
    private final SystemConfigurationService configurationService;
    private final AuditService auditService;

    @Override
    @Transactional
    public void generateNewSession(User user, String refreshToken) {
        List<SessionEntity> userSessions = sessionRepo.findByUser(user);

        // Get current timeout configuration
        int timeoutMinutes = configurationService.getSessionTimeoutMinutes();
        LocalDateTime now = LocalDateTime.now();

        // Create new session
        SessionEntity newSession = SessionEntity.builder()
                .user(user)
                .refreshToken(refreshToken)
                .lastUsedAt(now)
                .sessionTimeoutMinutes(timeoutMinutes)
                .build();
        // If a session with the exact refresh token already exists, skip creation.
        // This guards against duplicate inserts when the endpoint is called twice
        // (for example, due to frontend double-submit in dev strict mode).
        if (sessionRepo.findByRefreshToken(refreshToken).isPresent()) {
            log.warn("Session with the same refresh token already exists for user: {}", user.getEmail());
            return;
        }

        sessionRepo.save(newSession);
        log.info("Created new session for user: {} with timeout: {} minutes",
                user.getEmail(), timeoutMinutes);
    }

    @Override
    @Transactional
    public void validateSession(String refreshToken) throws SessionAuthenticationException {
        SessionEntity session = sessionRepo.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new SessionAuthenticationException(
                        "Session not found. Please sign in again."));

        // Check if session has expired due to inactivity
        if (session.isExpired()) {
            User user = session.getUser();
            sessionRepo.delete(session);
            log.warn("Session expired for user: {}", user.getEmail());

            // Audit log for session expiry due to inactivity
            try {
                auditService.logEvent(EventType.SESSION_EXPIRED,
                        AuditLog.SESSION_EXPIRED_INACTIVITY, user, null);
            } catch (Exception e) {
                log.error("Failed to log session expiry audit event for user: {}", user.getEmail(), e);
            }

            throw new SessionAuthenticationException(
                    "You've been signed out due to inactivity. Please sign in again.");
        }

        // Session is valid - update last used time
        session.updateLastUsed();
        sessionRepo.save(session);
        log.debug("Session validated and updated for user: {}", session.getUser().getEmail());
    }

    @Override
    @Transactional
    public void keepSessionAlive(String refreshToken) throws SessionAuthenticationException {
        validateSession(refreshToken); // This already updates lastUsedAt
        log.debug("Keep-alive signal received for token");
    }

    @Override
    @Scheduled(fixedRate = 600000) // 10 min in milliseconds
    @Transactional
    public void cleanupExpiredSessions() {
        log.info("Starting scheduled session cleanup...");

        // Get all sessions that haven't been used in the last 15 minutes
        // (15 is the maximum possible timeout)
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<SessionEntity> potentiallyExpiredSessions = sessionRepo.findExpiredSessions(threshold);

        int deletedCount = 0;
        for (SessionEntity session : potentiallyExpiredSessions) {
            if (session.isExpired()) {
                User user = session.getUser();
                sessionRepo.delete(session);
                deletedCount++;

                // Audit log for scheduled session cleanup
                try {
                    auditService.logEvent(EventType.SESSION_EXPIRED,
                            AuditLog.SESSION_EXPIRED_CLEANUP, user, null);
                } catch (Exception e) {
                    log.error("Failed to log cleanup audit event for user: {}", user.getEmail(), e);
                }
            }
        }

        log.info("Session cleanup completed. Deleted {} expired sessions", deletedCount);
    }

    @Override
    @Transactional
    public void deleteAllUserSessions(User user) {
        sessionRepo.deleteByUser(user);
        log.info("Deleted all sessions for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void rotateRefreshToken(String oldRefreshToken, String newRefreshToken)
            throws SessionAuthenticationException {
        SessionEntity session = sessionRepo.findByRefreshToken(oldRefreshToken)
                .orElseThrow(() -> new SessionAuthenticationException(
                        "Session not found. Please sign in again."));

        if (session.isExpired()) {
            sessionRepo.delete(session);
            throw new SessionAuthenticationException(
                    "You've been signed out due to inactivity. Please sign in again.");
        }

        session.setRefreshToken(newRefreshToken);
        session.updateLastUsed();
        sessionRepo.save(session);
        log.info("Rotated refresh token for user: {}", session.getUser().getEmail());
    }

    @Override
    @Transactional
    public boolean revokeSession(String refreshToken) {
        var sessionOpt = sessionRepo.findByRefreshToken(refreshToken);
        if (sessionOpt.isPresent()) {
            SessionEntity session = sessionOpt.get();
            User user = session.getUser();
            // Delete ALL sessions for this user, not just the one matching the token.
            // This ensures logging out from one tab invalidates every active session.
            sessionRepo.deleteByUser(user);
            log.info("Revoked all sessions for user: {}", user.getEmail());
            return true;
        }
        return false;
    }

    @Override
    public boolean hasActiveSession(User user) {
        List<SessionEntity> sessions = sessionRepo.findByUser(user);
        return sessions.stream().anyMatch(s -> !s.isExpired());
    }
}
