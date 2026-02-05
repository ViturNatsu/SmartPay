package com.fdmgroup.SmartPay_BackEnd;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.OtpServiceImpl;

@SpringBootTest
public class OtpServiceTest {

    private OtpService otpService;

    @MockitoBean
    private OtpRepository otpRepository;

    @MockitoBean
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    private OtpDTO otpDTO;
    private Otp otp;

    @BeforeEach
    void setUp() {
        otpService = new OtpServiceImpl(otpRepository, userService, passwordEncoder, emailService);

        // Initialize test data
        String testEmail = "test@example.com";
        String testCode = "1234567";
        String hashedCode = passwordEncoder.encode(testCode);

        otpDTO = new OtpDTO(testEmail, testCode, OtpType.FORGOT_PASSWORD);

        otp = Otp.builder()
                .email(testEmail)
                .otpHash(hashedCode)
                .status(OtpStatus.ACTIVE)
                .otpType(OtpType.FORGOT_PASSWORD)
                .attemptsMade(1)
                .firstRequestAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusMinutes(45))
                .build();
    }

    @Test
    @DisplayName("Should create new Otp when all validations pass")
    void testRequestOtp_whenFirstRequest_savesNewOtp() {
        // Arrange
        when(userService.findByEmail(otpDTO.getEmail())).thenReturn(null);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.empty());

        // Act
        otpService.requestOtp(otp.getEmail(), OtpType.FORGOT_PASSWORD);

        // Assert
        ArgumentCaptor<Otp> otpCaptor = ArgumentCaptor.forClass(Otp.class);

        verify(otpRepository, times(1)).save(otpCaptor.capture());

        Otp savedOtp = otpCaptor.getValue();

        assertEquals("test@example.com", savedOtp.getEmail());
        assertNotNull(savedOtp.getFirstRequestAt());
        assertEquals(1, savedOtp.getAttemptsMade());
        assertNotNull(savedOtp.getOtpHash());
        assertEquals(OtpStatus.ACTIVE, savedOtp.getStatus());

        verify(emailService, times(1)).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should reset Otp when resetTime has passed")
    void testRequestOtp_whenRequestPastResetTime_resetsOtp() {
        // Arrange
        LocalDateTime originalFirstRequestAt = LocalDateTime.now().minusHours(25);
        otp.setFirstRequestAt(originalFirstRequestAt);

        when(userService.findByEmail(otpDTO.getEmail())).thenReturn(null);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        otpService.requestOtp(otp.getEmail(), OtpType.FORGOT_PASSWORD);

        // Assert
        ArgumentCaptor<Otp> otpCaptor = ArgumentCaptor.forClass(Otp.class);

        verify(otpRepository, times(1)).save(otpCaptor.capture());

        Otp savedOtp = otpCaptor.getValue();

        assertEquals("test@example.com", savedOtp.getEmail());
        assertNotEquals(originalFirstRequestAt, savedOtp.getFirstRequestAt());
        assertEquals(1, savedOtp.getAttemptsMade());
        assertNotNull(savedOtp.getOtpHash());
        assertEquals(OtpStatus.ACTIVE, savedOtp.getStatus());

        verify(emailService, times(1)).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should update Otp when resetTime has not passed")
    void testRequestOtp_whenRequestNotPastResetTime_updatesOtp() {
        // Arrange
        LocalDateTime originalFirstRequestAt = otp.getFirstRequestAt();

        when(userService.findByEmail(otpDTO.getEmail())).thenReturn(null);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        otpService.requestOtp(otp.getEmail(), OtpType.FORGOT_PASSWORD);

        // Assert
        ArgumentCaptor<Otp> otpCaptor = ArgumentCaptor.forClass(Otp.class);

        verify(otpRepository, times(1)).save(otpCaptor.capture());

        Otp savedOtp = otpCaptor.getValue();

        assertEquals("test@example.com", savedOtp.getEmail());
        assertEquals(originalFirstRequestAt, savedOtp.getFirstRequestAt());
        assertEquals(2, savedOtp.getAttemptsMade());
        assertNotNull(savedOtp.getOtpHash());
        assertEquals(OtpStatus.ACTIVE, savedOtp.getStatus());

        verify(emailService, times(1)).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should return ACCEPTED and not save/email when user does not exist")
    void testRequestOtp_whenUserDoesNotExist_returnsAcceptedSilently() {
        // Arrange
        String email = "unknown@example.com";
        // Simulate your service throwing the exception you catch in the impl
        when(userService.findByEmail(email)).thenThrow(new UserNotFoundException("User not found"));

        // Act
        HttpStatus status = otpService.requestOtp(email, OtpType.FORGOT_PASSWORD);

        // Assert
        assertEquals(HttpStatus.ACCEPTED, status);
        verify(otpRepository, never()).save(any());
        verify(emailService, never()).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should throw AccountLockedException when account is already locked")
    void testRequestOtp_whenAlreadyLocked_throwsException() {
        // Arrange
        otp.setStatus(OtpStatus.LOCKED);
        otp.setFirstRequestAt(LocalDateTime.now().minusHours(1));

        when(userService.findByEmail(otp.getEmail())).thenReturn(null);
        when(otpRepository.findByEmailAndOtpType(otp.getEmail(), otp.getOtpType()))
                .thenReturn(Optional.of(otp));

        // Act & Assert
        assertThrows(AccountLockedException.class, () -> {
            otpService.requestOtp(otp.getEmail(), otp.getOtpType());
        });

        verify(emailService, never()).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should lock account and throw exception when limit is reached")
    void testRequestOtp_whenLimitReached_locksAccountAndThrows() {
        // Arrange
        otp.setAttemptsMade(otp.getLimit());
        otp.setFirstRequestAt(LocalDateTime.now().minusHours(1));

        when(userService.findByEmail(otp.getEmail())).thenReturn(null);
        when(otpRepository.findByEmailAndOtpType(otp.getEmail(), otp.getOtpType()))
                .thenReturn(Optional.of(otp));

        // Act & Assert
        assertThrows(AccountLockedException.class, () -> {
            otpService.requestOtp(otp.getEmail(), otp.getOtpType());
        });

        // Capture the save call that happened BEFORE the exception
        ArgumentCaptor<Otp> otpCaptor = ArgumentCaptor.forClass(Otp.class);

        verify(otpRepository).save(otpCaptor.capture());
        assertEquals(OtpStatus.LOCKED, otpCaptor.getValue().getStatus());

        verify(emailService, times(1)).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should successfully verify OTP when all validations pass")
    void testVerifyOtp_Success() {
        // Arrange
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertEquals(otp.getEmail(), result.getEmail());
        assertTrue(passwordEncoder.matches(otpDTO.getCode(), result.getOtpHash()));
        assertEquals(OtpStatus.ACTIVE, result.getStatus());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw EmailNotFoundException when email not found in database")
    void testVerifyOtp_EmailNotFound() {
        // Arrange
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.empty());

        // Act & Assert
        EmailNotFoundException exception = assertThrows(EmailNotFoundException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw EmailNotFoundException when email not found");

        assertEquals("No OTP found for the provided email address.", exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw AccessCodeMismatchException when code does not match")
    void testVerifyOtp_CodeMismatch() {
        // Arrange
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));
        otpDTO.setCode("7654321");

        // Act & Assert
        assertFalse(passwordEncoder.matches(otpDTO.getCode(), otp.getOtpHash()));
        AccessCodeMismatchException exception = assertThrows(AccessCodeMismatchException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw AccessCodeMismatchException when code is invalid");

        assertEquals("This code is invalid. Please verify the code and try again.", exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw AccessCodeExpiredException when OTP has expired")
    void testVerifyOtp_ExpiredCode() {
        // Arrange
        otp.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // Set expiration time in past
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act & Assert
        assertTrue(passwordEncoder.matches(otpDTO.getCode(), otp.getOtpHash()));
        assertTrue(otp.isExpired());
        AccessCodeExpiredException exception = assertThrows(AccessCodeExpiredException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw AccessCodeExpiredException when OTP has expired");

        assertEquals("This code has expired or has already been used. Please request a new code",
                exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw AccessCodeUsedException when OTP has already been used")
    void testVerifyOtp_CodeAlreadyUsed() {
        // Arrange
        otp.setStatus(OtpStatus.USED);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act & Assert
        assertTrue(passwordEncoder.matches(otpDTO.getCode(), otp.getOtpHash()));
        assertTrue(otp.isUsed());
        AccessCodeUsedException exception = assertThrows(AccessCodeUsedException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw AccessCodeUsedException when code has been used");

        assertEquals("This code has expired or has already been used. Please request a new code",
                exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw AccountLockedException when maximum attempts exceeded")
    void testVerifyOtp_MaxAttemptsExceeded() {
        // Arrange
        otp.setAttemptsMade(5); // Set attempts to max (5)
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act & Assert
        AccountLockedException exception = assertThrows(AccountLockedException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw AccountLockedException when attempts >= 5");

        assertEquals(
                "We can't process this request right now. Account has been locked for too many attempts. Please try again later",
                exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should throw AccountLockedException when attempts exceed maximum")
    void testVerifyOtp_AttemptsGreaterThanFive() {
        // Arrange
        otp.setAttemptsMade(6); // Set attempts > 5
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act & Assert
        AccountLockedException exception = assertThrows(AccountLockedException.class,
                () -> otpService.verifyOtp(otpDTO),
                "Should throw AccountLockedException when attempts > 5");

        assertEquals(
                "We can't process this request right now. Account has been locked for too many attempts. Please try again later",
                exception.getMessage());
        verify(otpRepository, times(1)).findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType());
    }

    @Test
    @DisplayName("Should verify OTP with exactly 4 attempts (boundary test)")
    void testVerifyOtp_BoundaryAttempts_Four() {
        // Arrange
        otp.setAttemptsMade(4); // Just below max
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getAttemptsMade());
    }

    @Test
    @DisplayName("Should verify OTP with zero attempts")
    void testVerifyOtp_ZeroAttempts() {
        // Arrange
        otp.setAttemptsMade(0);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getAttemptsMade());
    }

    @Test
    @DisplayName("Should verify OTP with status ACTIVE")
    void testVerifyOtp_StatusActive() {
        // Arrange
        otp.setStatus(OtpStatus.ACTIVE);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertEquals(OtpStatus.ACTIVE, result.getStatus());
        assertTrue(passwordEncoder.matches(otpDTO.getCode(), result.getOtpHash()));
    }

    @Test
    @DisplayName("Should verify OTP not yet expired (boundary test)")
    void testVerifyOtp_NotExpiredBoundary() {
        // Arrange
        otp.setExpiresAt(LocalDateTime.now().plusSeconds(1));
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertFalse(result.isExpired());
        assertFalse(result.isUsed());
        assertTrue(passwordEncoder.matches(otpDTO.getCode(), result.getOtpHash()));
    }

    @Test
    @DisplayName("Should verify OTP with correct email type matching")
    void testVerifyOtp_CorrectOtpType() {
        // Arrange
        otp.setOtpType(OtpType.FORGOT_PASSWORD);
        when(otpRepository.findByEmailAndOtpType(otpDTO.getEmail(), otpDTO.getType())).thenReturn(Optional.of(otp));

        // Act
        Otp result = otpService.verifyOtp(otpDTO);

        // Assert
        assertNotNull(result);
        assertEquals(OtpType.FORGOT_PASSWORD, result.getOtpType());
    }

}
