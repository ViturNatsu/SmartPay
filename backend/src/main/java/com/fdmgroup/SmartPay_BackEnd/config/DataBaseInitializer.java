package com.fdmgroup.SmartPay_BackEnd.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;

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
            if (userRepository.findByEmail("admin1@example.com").isEmpty()) {
                User admin1 = User.builder()
                        .firstName("Admin1FirstName")
                        .lastName("Admin1LastName")
                        .email("admin1@example.com")
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Admin1@1234"))
                        .build();
                userRepository.save(admin1);
                log.info("Database initialized with admin1 user: {}", admin1.getEmail());

            }

            if (userRepository.findByEmail("admin2@example.com").isEmpty()) {
                User admin2 = User.builder()
                        .firstName("Admin2FirstName")
                        .lastName("Admin2LastName")
                        .email("admin2@example.com")
                        .role(Role.ADMIN)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Admin2@1234"))
                        .build();
                userRepository.save(admin2);
                log.info("Database initialized with admin2 user: {}", admin2.getEmail());

            }

            if (userRepository.findByEmail("test@example.com").isEmpty()) {
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
            }

            if (userRepository.findByEmail("test2@example.com").isEmpty()) {
                User testUser2 = User.builder()
                        .firstName("TestFirstName2")
                        .lastName("TestLastName2")
                        .email("test2@example.com")
                        .role(Role.USER)
                        .emailVerified(true)
                        .emailVerifiedAt(LocalDateTime.now())
                        .password(encoderConfig.passwordEncoder().encode("Test@1234"))
                        .build();
                userRepository.save(testUser2);
                log.info("Database initialized with test user: {}", testUser2.getEmail());


                Customer testCustomer2 = Customer.builder()
                        .user(testUser2)
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
                customerRepository.save(testCustomer2);
                log.info("Database initialized with test customer for user: {}", testCustomer2.getUser().getEmail());

            }

        };
    }
}