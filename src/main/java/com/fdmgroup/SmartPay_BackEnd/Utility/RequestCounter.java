package com.fdmgroup.SmartPay_BackEnd.Utility;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

@Component
public class RequestCounter {

    private static final Logger LOGGER = Logger.getLogger(RequestCounter.class.getName());
    private static final int MAX_REQUESTS_PER_MINUTE = 3;
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    public boolean requestAllowed(String clientIp) {
        requestCounts.putIfAbsent(clientIp, new AtomicInteger(0));
        int currentCount = requestCounts.get(clientIp).incrementAndGet();

        // Return true when the request is allowed (count is within the limit).
        return currentCount <= MAX_REQUESTS_PER_MINUTE;
    }

    @Scheduled(fixedRate = 60000)
    public void resetCounts() {
        requestCounts.clear();
        LOGGER.log(Level.INFO, "Rate limit count reset by scheduled task");
    }
}
