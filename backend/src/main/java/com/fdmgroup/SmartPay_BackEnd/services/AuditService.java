package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface AuditService {
    public void logEvent(EventType eventType, String eventStatus, User user, Map<String, Object> eventData,
            HttpServletRequest request);

    public void logEvent(EventType eventType, String eventStatus, User user, HttpServletRequest request);
}
