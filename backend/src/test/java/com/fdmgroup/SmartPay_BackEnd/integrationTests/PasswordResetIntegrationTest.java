package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers.IntegrationTestHelper;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.system.AuditLogRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@org.springframework.security.test.context.support.WithMockUser
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class PasswordResetIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    //        @MockitoBean
    //        private JwtService jwtService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private SessionService sessionService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User testUser;
    private final String rawOtp = "1234567";

    @Autowired
    private IntegrationTestHelper helper;

        @BeforeEach
        void setUp() {
                helper.clearDB();

        testUser = User.builder()
                        .firstName("Test")
                        .lastName("User")
                        .email("test@example.com")
                        .password(passwordEncoder.encode("OldPassword123!"))
                        .status("ACTIVE")
                        .emailVerified(true) // Ensure user is enabled if checked
                        .role(com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role.USER)
                        .build();
        userRepository.save(testUser);
    }

    @Test
    void testPasswordResetFlow_Success() throws Exception {
            // Given
            Otp otp = Otp.builder()
                            .email(testUser.getEmail())
                            .otpHash(passwordEncoder.encode(rawOtp))
                            .otpType(EventType.FORGOT_PASSWORD)
                            .status(OtpStatus.ACTIVE)
                            .expiresAt(LocalDateTime.now().plusMinutes(45))
                            .attemptsMade(0)
                            .build();
            otpRepository.save(otp);

            PasswordResetWithOtpDto request = PasswordResetWithOtpDto.builder()
                            .email(testUser.getEmail())
                            .password1("NewPassword123!")
                            .password2("NewPassword123!")
                            .accessCode(rawOtp)
                            .build();

            // When
            mockMvc.perform(put("/api/v1/password-reset/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isOk());

            // Then
            User updatedUser = userRepository.findByEmail(testUser.getEmail()).orElseThrow();
            assertTrue(passwordEncoder.matches("NewPassword123!", updatedUser.getPassword()),
                            "Password should be updated");
            assertNotNull(updatedUser.getLastPasswordChangeAt());

            Otp updatedOtp = otpRepository.findByEmailAndOtpType(testUser.getEmail(), EventType.FORGOT_PASSWORD)
                            .orElseThrow();
            assertEquals(OtpStatus.USED, updatedOtp.getStatus());

            assertFalse(auditLogRepository.findAll().isEmpty(), "Audit log should be created");
    }

    @Test
    void testPasswordResetFlow_InvalidOtp() throws Exception {
            // Given
            Otp otp = Otp.builder()
                            .email(testUser.getEmail())
                            .otpHash(passwordEncoder.encode(rawOtp))
                            .otpType(EventType.FORGOT_PASSWORD)
                            .status(OtpStatus.ACTIVE)
                            .expiresAt(LocalDateTime.now().plusMinutes(15))
                            .attemptsMade(0)
                            .build();
            otpRepository.save(otp);

            PasswordResetWithOtpDto request = PasswordResetWithOtpDto.builder()
                            .email(testUser.getEmail())
                            .password1("NewPassword123!")
                            .password2("NewPassword123!")
                            .accessCode("wrongcode")
                            .build();

            // When & Then
            // Should return 422 because of @Pattern(regexp = "^\\d{7}$") in DTO
            mockMvc.perform(put("/api/v1/password-reset/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isUnprocessableContent());
    }

    @Test
    void testPasswordResetFlow_ExpiredOtp() throws Exception {
            // Given
            Otp otp = Otp.builder()
                            .email(testUser.getEmail())
                            .otpHash(passwordEncoder.encode(rawOtp))
                            .otpType(EventType.FORGOT_PASSWORD)
                            .status(OtpStatus.ACTIVE)
                            .expiresAt(LocalDateTime.now().minusMinutes(1))
                            .attemptsMade(0)
                            .build();
            otpRepository.save(otp);

            PasswordResetWithOtpDto request = PasswordResetWithOtpDto.builder()
                            .email(testUser.getEmail())
                            .password1("NewPassword123!")
                            .password2("NewPassword123!")
                            .accessCode(rawOtp)
                            .build();

            // When & Then
            mockMvc.perform(put("/api/v1/password-reset/change-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isUnauthorized());
    }
}
