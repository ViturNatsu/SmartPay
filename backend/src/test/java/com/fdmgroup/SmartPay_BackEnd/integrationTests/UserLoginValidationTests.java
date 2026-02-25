package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import com.fdmgroup.SmartPay_BackEnd.exception.LoginInvalidCredentialsException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class UserLoginValidationTests {

    @Mock
    UserRepository mockUserRepository;

    EncoderConfig encoderConfig;
    UserService userService;

    @BeforeEach
    void setUp() {
        encoderConfig = new EncoderConfig();
        userService = new UserServiceImpl(mockUserRepository, encoderConfig);
    }

    @Test
    void validateCredentials_success_when_email_and_password_match() {
        String rawPassword = "password123";
        String encodedPassword = encoderConfig.passwordEncoder().encode(rawPassword);

        User dbUser = User.builder()
                        .email("test@smartpay.com")
                        .password(encodedPassword)
                        .emailVerified(true)
                .build();

        Mockito.when(mockUserRepository.findByEmail("test@smartpay.com"))
                .thenReturn(Optional.of(dbUser));

        User result = userService.validateCredentials("test@smartpay.com", rawPassword);

        assertEquals("test@smartpay.com", result.getEmail());
    }

    @Test
    void validateCredentials_fails_when_password_is_incorrect() {
        String encodedPassword = encoderConfig.passwordEncoder().encode("correctPassword");
        User dbUser = new User("test@smartpay.com", encodedPassword);

        Mockito.when(mockUserRepository.findByEmail("test@smartpay.com"))
                .thenReturn(Optional.of(dbUser));

        assertThrows(LoginInvalidCredentialsException.class, () ->
                userService.validateCredentials("test@smartpay.com", "wrongPassword"));
    }

    @Test
    void validateCredentials_fails_when_email_not_found() {
        Mockito.when(mockUserRepository.findByEmail("missing@smartpay.com"))
                .thenReturn(Optional.empty());

        assertThrows(LoginInvalidCredentialsException.class, () ->
                userService.validateCredentials("missing@smartpay.com", "password123"));
    }

    @Test
    void validateCredentials_fails_when_email_or_password_blank() {
        assertThrows(LoginInvalidCredentialsException.class, () ->
                userService.validateCredentials("", "password123"));

        assertThrows(LoginInvalidCredentialsException.class, () ->
                userService.validateCredentials("test@smartpay.com", ""));
    }
}

