package com.fdmgroup.SmartPay_BackEnd.services.impl;


import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.PasswordResetRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;

@Component
public class TestDeleteLater implements CommandLineRunner {

    private final PasswordResetRepository resetRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TestDeleteLater(PasswordResetRepository resetRepository, 
                           UserRepository userRepository, 
                           PasswordEncoder passwordEncoder) {
        this.resetRepository = resetRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Create and Save the User using the Builder
        User testUser = User.builder()
                .email("test@gmail.com")
                .password(passwordEncoder.encode("Password123!"))
                .status("ACTIVE")
                .emailVerified(true)
                .createdAt(LocalDateTime.now())
                .build();
        
        userRepository.save(testUser);

        // 2. Create the PasswordReset using its Builder
        String rawCode = "1234567";
        PasswordReset dummyReset = PasswordReset.builder()
                .email("test@gmail.com")
                .user(testUser)
                .tokenHash(passwordEncoder.encode(rawCode)) // Matches your service logic
                .type(PasswordReset.PasswordResetType.PASSWORD_RESET)
                .attemptsRemaining(5)
                .status(PasswordReset.PasswordResetStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        resetRepository.save(dummyReset);


        dummyReset.markAsUsed();
        resetRepository.save(dummyReset);

        System.out.println("DEBUG: Created dummy record for test@gmail.com with code: " + rawCode);
    }
}