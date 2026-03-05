package com.fdmgroup.SmartPay_BackEnd.services.system;

public interface SystemConfigurationService {
    void initializeDefaults();
    int getSessionTimeoutMinutes();
    void setSessionTimeoutMinutes(int minutes);
}
