package com.fdmgroup.SmartPay_BackEnd.services.system;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.UUID;

public interface AuditService {
    public UUID logEvent(EventType eventType, String eventStatus, User user, Map<String, Object> eventData,
                         HttpServletRequest request);

    public UUID logEvent(EventType eventType, String eventStatus, User user, HttpServletRequest request);
}
