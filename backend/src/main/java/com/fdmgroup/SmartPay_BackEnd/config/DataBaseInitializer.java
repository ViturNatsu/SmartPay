package com.fdmgroup.SmartPay_BackEnd.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DataBaseInitializer {
    private final EncoderConfig encoderConfig;

    DataBaseInitializer(EncoderConfig encoderConfig) {
        this.encoderConfig = encoderConfig;
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            User testUser = User.builder()
                    .firstName("TestFirstName")
                    .lastName("TestLastName")
                    .institution("Chase")   
                    .email("test@example.com")
                    .role(Role.USER)
                    .emailVerified(true)
                    .emailVerifiedAt(LocalDateTime.now())
                    .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                    .build();
            userRepository.save(testUser);

            userRepository.save(testUser);
            log.info("Database initialized with test user: {}", testUser.getEmail());
        };
    }

}