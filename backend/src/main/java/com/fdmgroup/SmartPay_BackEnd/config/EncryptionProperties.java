package com.fdmgroup.SmartPay_BackEnd.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EncryptionProperties {

    private static String secretKey;

    @Value("${encryption.secret-key}")
    public void setSecretKey(String key) {
        EncryptionProperties.secretKey = key;
    }

    public static String getSecretKey() {
        return secretKey;
    }
}
