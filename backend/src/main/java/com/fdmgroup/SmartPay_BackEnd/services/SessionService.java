package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.SessionAuthenticationException;

public interface SessionService {
    void generateNewSession(User user, String refreshToken);

    void validateSession(String refreshToken) throws SessionAuthenticationException;

    void keepSessionAlive(String refreshToken) throws SessionAuthenticationException;

    void cleanupExpiredSessions();

    void deleteAllUserSessions(User user);

    void rotateRefreshToken(String oldRefreshToken, String newRefreshToken) throws SessionAuthenticationException;

    boolean revokeSession(String refreshToken);

    boolean hasActiveSession(User user);
}
