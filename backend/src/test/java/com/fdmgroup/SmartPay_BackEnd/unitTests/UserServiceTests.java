package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fdmgroup.SmartPay_BackEnd.config.EncoderConfig;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.impl.RegistrationServiceImpl;
import com.fdmgroup.SmartPay_BackEnd.services.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceTests {

    @Mock
    private UserRepository mockUserRepo;

    @Mock
    private EncoderConfig encoderConfig;

    @InjectMocks
    private UserServiceImpl userService;

    @InjectMocks
    private RegistrationServiceImpl registrationService;

    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void signUpUser_shouldEncodePasswordAndSaveUser() {
        when(encoderConfig.passwordEncoder()).thenReturn(passwordEncoder);
        User user = User.builder()
                .email("test@test.com")
                .password("plaintext")
                .build();

        when(mockUserRepo.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User savedUser = userService.signUpUser(user);

        assertNotEquals("plaintext", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("plaintext", savedUser.getPassword()));
        verify(mockUserRepo, times(1)).save(user);
    }

    @Test
    void findByEmail_shouldReturnUser_whenUserExists() throws UserNotFoundException {
        User user = User.builder().email("test@test.com").build();
        when(mockUserRepo.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        User found = userService.findByEmail("test@test.com");

        assertEquals(user, found);
    }

    @Test
    void findByEmail_shouldThrowException_whenUserDoesNotExist() {
        when(mockUserRepo.findByEmail("missing@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> userService.findByEmail("missing@test.com"));
    }

    @Test
    void signUpUser_shouldThrowException_whenUserAlreadyExistsAndEmailIsNotVerified() {
        User user = User.builder().email("test@test.com").build();
        SignUpDTO userDto = new SignUpDTO();
        userDto.setEmail("test@test.com");
        when(mockUserRepo.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        assertThrows(DuplicateEmailException.class,
                () -> registrationService.register(userDto));
    }

    @Test
    void signUpUser_shouldThrowException_whenUserAlreadyExistsAndEmailIsVerified() {
        User user = User.builder().email("test@test.com").emailVerified(true).build();
        SignUpDTO userDto = new SignUpDTO();
        userDto.setEmail("test@test.com");
        when(mockUserRepo.findByEmail("test@test.com"))
                .thenReturn(Optional.of(user));

        assertThrows(DuplicateEmailException.class,
                () -> registrationService.register(userDto));
    }

}