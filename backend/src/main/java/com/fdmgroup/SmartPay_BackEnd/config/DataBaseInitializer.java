package com.fdmgroup.SmartPay_BackEnd.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.CustomerRepository;
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
    CommandLineRunner initDatabase(UserRepository userRepository, CustomerRepository customerRepository) {
        return args -> {
            User testUser = User.builder()
                    .firstName("TestFirstName")
                    .lastName("TestLastName")
                    .email("test@example.com")
                    .role(Role.USER)
                    .emailVerified(true)
                    .emailVerifiedAt(LocalDateTime.now())
                    .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                    .build();
            userRepository.save(testUser);
            log.info("Database initialized with test user: {}", testUser.getEmail());

            Customer testCustomer = Customer.builder()
                .user(testUser)
                .addressLine1("130 Adelaide St W")
                .city("Toronto")
                .country("Canada")
                .createdAt(LocalDateTime.now())
                .dob("20000101")
                .firstName("TestFirstName")
                .lastName("TestLastName")
                .occupation("Software Engineer")
                .phoneNumber("4161234567")
                .postalCode("M5H 2N2")
                .province("ON")
                .socialInsuranceNumber("123-456-789")
                .governmentIdNumber("A1234567")
                .governmentIdType(GovernmentIdType.PASSPORT)
                .updatedAt(LocalDateTime.now())
                .build();
            customerRepository.save(testCustomer);
            log.info("Database initialized with test customer for user: {}", testCustomer.getUser().getEmail());
        };
    }
}