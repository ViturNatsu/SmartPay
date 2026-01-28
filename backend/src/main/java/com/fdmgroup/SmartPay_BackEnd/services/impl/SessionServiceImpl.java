package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.SessionEntity;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.SessionAuthenticationException;
import com.fdmgroup.SmartPay_BackEnd.repositories.SessionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.SystemConfigurationService;
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
            sessionRepo.delete(session);
            log.warn("Session expired for user: {}", session.getUser().getEmail());
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
                sessionRepo.delete(session);
                deletedCount++;
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
    public void rotateRefreshToken(String oldRefreshToken, String newRefreshToken) throws SessionAuthenticationException {
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
    public void revokeSession(String refreshToken) {
        sessionRepo.findByRefreshToken(refreshToken).ifPresent(session -> {
            sessionRepo.delete(session);
            log.info("Revoked session for user: {}", session.getUser().getEmail());
        });
    }
}
