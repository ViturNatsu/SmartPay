package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;

@SpringJUnitConfig(EncoderConfig.class)
class EncoderConfigTests {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testEncoding() {
        String rawPassword = "password123";

        String hash = passwordEncoder.encode(rawPassword);

        assertThat(hash).isNotEqualTo(rawPassword)
                .startsWith("$argon2id$");

        assertThat(passwordEncoder.matches(rawPassword, hash)).isTrue();
    }
}
