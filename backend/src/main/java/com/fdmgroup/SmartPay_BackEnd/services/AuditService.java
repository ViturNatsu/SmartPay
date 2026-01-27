package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface AuditService {
    public void logEvent(String eventType, User user, Map<String, Object> eventData, HttpServletRequest request);
    public void logEvent(String eventType, User user, HttpServletRequest request);
}
