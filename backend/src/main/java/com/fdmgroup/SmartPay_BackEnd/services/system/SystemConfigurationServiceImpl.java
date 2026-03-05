package com.fdmgroup.SmartPay_BackEnd.services.system;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.system.SystemConfiguration;
import com.fdmgroup.SmartPay_BackEnd.repositories.system.SystemConfigurationRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SystemConfigurationServiceImpl implements SystemConfigurationService {
    private final SystemConfigurationRepository configRepo;

    @Value("${session.default.timeout.minutes}")
    private int defaultTimeout;

    private static final String SESSION_TIMEOUT_KEY = "session_timeout_minutes";

    /**
     * Initialize default configuration on startup
     */
    @Override
    @PostConstruct
    public void initializeDefaults() {
        if (configRepo.findByConfigKey(SESSION_TIMEOUT_KEY).isEmpty()) {
            SystemConfiguration newConfig = SystemConfiguration.builder()
                    .configKey(SESSION_TIMEOUT_KEY)
                    .configValue(String.valueOf(defaultTimeout))
                    .build();
            configRepo.save(newConfig);
        }
    }

    @Override
    public int getSessionTimeoutMinutes() {
        return configRepo.findByConfigKey(SESSION_TIMEOUT_KEY)
                .map(config -> Integer.parseInt(config.getConfigValue()))
                .orElse(defaultTimeout);
    }

    @Override
    public void setSessionTimeoutMinutes(int minutes) {
        if (minutes != 5 && minutes != 10 && minutes != 15) {
            throw new IllegalArgumentException(
                    "Session timeout must be 5, 10, or 15 minutes. Received: " + minutes);
        }

        SystemConfiguration config = configRepo.findByConfigKey(SESSION_TIMEOUT_KEY)
                .orElse(SystemConfiguration.builder()
                        .configKey(SESSION_TIMEOUT_KEY)
                        .build());

        config.setConfigValue(String.valueOf(minutes));
        configRepo.save(config);
    }
}