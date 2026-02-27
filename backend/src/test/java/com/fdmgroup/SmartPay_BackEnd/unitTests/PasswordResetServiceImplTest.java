package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AuditLog;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.services.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.PasswordResetServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceImplTest {

        @Mock
        private AuditService auditService;

        @Mock
        private OtpService otpService;

        @Mock
        private UserService userService;

        @Mock
        private PasswordEncoder passwordEncoder;

        @Mock
        private HttpServletRequest httpServletRequest;

        @InjectMocks
        private PasswordResetServiceImpl passwordResetService;

        @Test
        void resetPasswordWithOTP_success() {

                // Arrange

                PasswordResetWithOtpDto request = mock(PasswordResetWithOtpDto.class);

                when(request.passwordsMatch()).thenReturn(true);
                when(request.getEmail()).thenReturn("test@test.com");
                when(request.getAccessCode()).thenReturn("123456");
                when(request.getPassword1()).thenReturn("newPassword");

                Otp otp = mock(Otp.class);
                when(otp.getEmail()).thenReturn("test@test.com");

                User user = User.builder()
                                .email("test@test.com")
                                .build();
                ;

                when(otpService.verifyOtp(any(OtpDTO.class), any(HttpServletRequest.class))).thenReturn(otp);
                when(userService.findByEmail("test@test.com")).thenReturn(user);

                when(passwordEncoder.encode("newPassword"))
                                .thenReturn("encodedPassword");

                // Act

                passwordResetService.resetPasswordWithOTP(request, httpServletRequest);

                // Assert

                // password updated
                assertEquals("encodedPassword", user.getPassword());
                assertNotNull(user.getLastPasswordChangeAt());

                // verify OTP flow
                verify(otpService).verifyOtp(any(OtpDTO.class), any(HttpServletRequest.class));
                verify(otp).markAsUsed();
                verify(otpService).save(otp);

                // verify user saved
                verify(userService).save(user);

                // verify audit log
                verify(auditService).logEvent(
                                eq(EventType.FORGOT_PASSWORD),
                                eq(AuditLog.PASSWORD_RESET_COMPLETED),
                                eq(user),
                                eq(httpServletRequest));
        }

        @Test
        void resetPasswordWithOTP_passwordsDoNotMatch_shouldThrowException() {

                // Arrange

                PasswordResetWithOtpDto request = mock(PasswordResetWithOtpDto.class);

                when(request.passwordsMatch()).thenReturn(false);

                // Act + Assert

                assertThrows(
                                PasswordResetDoNotMatchException.class,
                                () -> passwordResetService.resetPasswordWithOTP(request, httpServletRequest));

                // Ensure nothing else was called
                verifyNoInteractions(otpService, userService, auditService);
        }

        @Test
        void resetPasswordWithOTP_OTPIsInvalid_shouldThrowException() {

                // Arrange

                PasswordResetWithOtpDto request = mock(PasswordResetWithOtpDto.class);
                when(request.passwordsMatch()).thenReturn(true);
                when(otpService.verifyOtp(any(OtpDTO.class), any(HttpServletRequest.class)))
                                .thenThrow(AccessCodeExpiredException.class);

                // Act + Assert

                assertThrows(
                                AccessCodeExpiredException.class,
                                () -> passwordResetService.resetPasswordWithOTP(request, httpServletRequest));

                // Ensure nothing else was called
                verifyNoInteractions(userService, auditService);
        }

        @Test
        void resetPasswordWithOTP_userNotFound_shouldThrowException() {

                // Arrange

                PasswordResetWithOtpDto request = mock(PasswordResetWithOtpDto.class);

                when(request.passwordsMatch()).thenReturn(true);
                when(request.getEmail()).thenReturn("test@test.com");
                when(request.getAccessCode()).thenReturn("123456");

                Otp otp = mock(Otp.class);
                when(otp.getEmail()).thenReturn("test@test.com");

                when(otpService.verifyOtp(any(OtpDTO.class), any(HttpServletRequest.class))).thenReturn(otp);

                when(userService.findByEmail(anyString())).thenThrow(UserNotFoundException.class);

                // Act + Assert

                assertThrows(
                                UserNotFoundException.class,
                                () -> passwordResetService.resetPasswordWithOTP(request, httpServletRequest));

                // Ensure nothing else was called
                verifyNoInteractions(auditService);
        }

        @Test
        void resetPasswordWithOTP_nullPasswords_shouldThrowException() {
                // Arrange
                PasswordResetWithOtpDto request = mock(PasswordResetWithOtpDto.class);
                when(request.passwordsMatch()).thenReturn(false); // passwordsMatch returns false if one is null

                // Act + Assert
                assertThrows(
                                PasswordResetDoNotMatchException.class,
                                () -> passwordResetService.resetPasswordWithOTP(request, httpServletRequest));

                // Ensure nothing else was called
                verifyNoInteractions(otpService, userService, auditService);
        }
}
