package com.fdmgroup.SmartPay_BackEnd;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class EncoderConfigTests {
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void testEncoding() {
        String rawPassword = "password123";

        String hash = passwordEncoder.encode(rawPassword);

        System.out.println("Raw password: " + rawPassword);
        System.out.println("Hash: " + hash);

        assertThat(hash).isNotEqualTo(rawPassword);

        assertThat(hash).startsWith("$argon2id$");

        assertThat(passwordEncoder.matches(rawPassword, hash)).isTrue();
    }
}
