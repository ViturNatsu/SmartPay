package com.fdmgroup.SmartPay_BackEnd.integrationTests;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.system.AuditLogRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.UserRepository;
import com.fdmgroup.SmartPay_BackEnd.services.integration.EmailService;

import jakarta.persistence.EntityManager;

@SpringBootTest(classes = com.fdmgroup.SmartPay_BackEnd.SmartPayBackEndApplication.class)
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class OTPIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EmailService emailService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EntityManager entityManager;

    private User user;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUp() {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        tx.execute(status -> {
            entityManager.createNativeQuery("DELETE FROM sessions").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM audit_log").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM customer_information").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM otp").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM chequing_accounts").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM accounts").executeUpdate();
            entityManager.createNativeQuery("DELETE FROM users").executeUpdate();
            return null;
        });

        user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@test.com")
                .password(passwordEncoder.encode("Password123"))
                .emailVerified(true)
                .role(Role.USER)
                .failedLoginAttempts(0)
                .build();

        userRepository.save(user);

    }

    @Test
    void shouldVerifyLoginOtpAndGenerateTokens() throws Exception {
        String rawCode = "1234567";
        String hashedCode = passwordEncoder.encode(rawCode);

        Otp otp = new Otp("test@test.com", EventType.LOGIN);
        otp.setOtpHash(hashedCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setStatus(Otp.OtpStatus.ACTIVE);
        otp.setAttemptsMade(0);
        otp.setAttemptsPerOtp(0);

        otpRepository.save(otp);
        mockMvc.perform(post("/api/v1/otp/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                              "email": "test@test.com",
                              "type": "LOGIN",
                              "code": "1234567"
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());

        Otp updated = otpRepository.findByEmailAndOtpType("test@test.com", EventType.LOGIN).get();
        assertEquals(0, updated.getAttemptsPerOtp());
    }

    @Test
    void shouldFailVerifyLoginOtpWithWrongCode() throws Exception {
        String rawCode = "1234567";
        String hashedCode = passwordEncoder.encode(rawCode);

        Otp otp = new Otp("test@test.com", EventType.LOGIN);
        otp.setOtpHash(hashedCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setStatus(Otp.OtpStatus.ACTIVE);
        otp.setAttemptsMade(0);
        otp.setAttemptsPerOtp(0);

        otpRepository.save(otp);

        mockMvc.perform(post("/api/v1/otp/verify")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                              "email": "test@test.com",
                              "type": "LOGIN",
                              "code": "9999999"
                            }
                        """))
                .andExpect(status().isBadRequest());
    }

}
