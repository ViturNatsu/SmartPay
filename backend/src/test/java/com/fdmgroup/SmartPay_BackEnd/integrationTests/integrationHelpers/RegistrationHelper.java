package com.fdmgroup.SmartPay_BackEnd.integrationTests.integrationHelpers;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.repositories.auth.OtpRepository;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Component
public class RegistrationHelper {

    public void registerOTP(PasswordEncoder passwordEncoder,
                            String email,
                            OtpRepository otpRepository,
                            MockMvc mockMvc) throws Exception {

        String rawCode = "1234561";
        String hashedCode = passwordEncoder.encode(rawCode);

        Otp otp = otpRepository.findByEmailAndOtpType(email, EventType.REGISTER).get();
        otp.setOtpHash(hashedCode);
        otpRepository.save(otp);

//        Otp otp = new Otp(email, EventType.REGISTER);
//        otp.setOtpHash(hashedCode);
//        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
//        otp.setStatus(Otp.OtpStatus.ACTIVE);
//        otp.setAttemptsMade(0);
//        otp.setAttemptsPerOtp(0);

//        otpRepository.save(otp);


        mockMvc.perform(post("/api/v1/otp/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "email": "%s",
                              "type": "REGISTER",
                              "code": "1234561"
                            }
                        """.formatted(email)))
                .andExpect(status().isOk());
    }
}
