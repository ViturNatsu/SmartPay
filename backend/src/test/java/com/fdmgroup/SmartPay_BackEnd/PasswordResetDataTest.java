package com.fdmgroup.SmartPay_BackEnd;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
public class PasswordResetDataTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpRepository otpRepository;

    @Test
    void testUserPersistenceAndLookup() {
        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .institution("Test")
                .email("john@example.com")
                .password("hash")
                .status("ACTIVE")
                .build();
        userRepository.save(user);

        Optional<User> found = userRepository.findByEmail("john@example.com");
        assertTrue(found.isPresent());
        assertEquals("John", found.get().getFirstName());
    }

    @Test
    void testOtpPersistenceAndLookup() {
        Optional<Otp> otp = otpRepository.findByEmailAndOtpType("test@example.com", OtpType.FORGOT_PASSWORD);

        if (otp.isEmpty()) {
            Otp new_otp = Otp.builder()
                    .email("test@example.com")
                    .otpHash("hash")
                    .otpType(OtpType.FORGOT_PASSWORD)
                    .status(OtpStatus.ACTIVE)
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .attemptsMade(0)
                    .build();
            otpRepository.save(new_otp);
        }

        Optional<Otp> found = otpRepository.findByEmailAndOtpType("test@example.com", EventType.FORGOT_PASSWORD);
        assertTrue(found.isPresent());
        assertEquals(OtpStatus.ACTIVE, found.get().getStatus());
    }

    @Test
    void testUpdateUserPasswordAndLastChange() {
        User user = User.builder()
                .firstName("John")
                .lastName("Doe")
                .institution("Test")
                .email("john@example.com")
                .password("old_hash")
                .status("ACTIVE")
                .build();
        user = userRepository.save(user);

        LocalDateTime now = LocalDateTime.now();
        user.setPassword("new_hash");
        user.setLastPasswordChangeAt(now);
        userRepository.save(user);

        User updated = userRepository.findById(user.getId()).orElseThrow();
        assertEquals("new_hash", updated.getPassword());
        assertNotNull(updated.getLastPasswordChangeAt());
    }

    @Test
    void testMarkOtpAsUsed() {
        Otp otp = Otp.builder()
                .email("test@example.com")
                .otpHash("hash")
                .otpType(EventType.FORGOT_PASSWORD)
                .status(OtpStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .attemptsMade(0)
                .build();
        otp = otpRepository.save(otp);

        otp.markAsUsed();
        otpRepository.save(otp);

        Otp updated = otpRepository.findById(otp.getOtpId()).orElseThrow();
        assertEquals(OtpStatus.USED, updated.getStatus());
    }
}
