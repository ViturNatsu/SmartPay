package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.user.PasswordResetController;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.user.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Controller tests for password reset endpoint
 */
@WebMvcTest(PasswordResetController.class)
@AutoConfigureMockMvc(addFilters = false)
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PasswordResetService passwordResetService;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String BASE_URL = "/api/v1/password-reset/change-password";

    private PasswordResetWithOtpDto validDto() {
        return PasswordResetWithOtpDto.builder()
                .email("user@example.com")
                .password1("Strong@123")
                .password2("Strong@123")
                .accessCode("1234567")
                .build();
    }

    private String asJson(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    @Test
    void shouldResetPasswordSuccessfully_whenValidRequest() throws Exception {

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isOk())
                .andExpect(content().string("Password Reset Successful"));

        verify(passwordResetService, times(1))
                .resetPasswordWithOTP(any(), any());
    }

    @Test
    void shouldReturn422_whenEmailIsInvalid() throws Exception {

        PasswordResetWithOtpDto dto = validDto();
        dto.setEmail("wrong-email");

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(dto)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void shouldReturn422_whenPasswordTooShort() throws Exception {

        PasswordResetWithOtpDto dto = validDto();
        dto.setPassword1("Ab@1");
        dto.setPassword2("Ab@1");

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(dto)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void shouldReturn422_whenPasswordHasNoSpecialCharacter() throws Exception {

        PasswordResetWithOtpDto dto = validDto();
        dto.setPassword1("Password123");
        dto.setPassword2("Password123");

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(dto)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void shouldReturn422_whenPasswordConfirmationMissing() throws Exception {

        PasswordResetWithOtpDto dto = validDto();
        dto.setPassword2("");

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(dto)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void houldReturn422_whenOtpIsNotSevenDigits() throws Exception {

        PasswordResetWithOtpDto dto = validDto();
        dto.setAccessCode("1234");

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(dto)))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void shouldReturn400_whenPasswordsDoNotMatch() throws Exception {

        doThrow(new PasswordResetDoNotMatchException("Passwords do not match"))
                .when(passwordResetService)
                .resetPasswordWithOTP(any(), any());

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturn401_whenOtpInvalidOrExpired() throws Exception {

        doThrow(new AccessCodeUsedException("OTP invalid"))
                .when(passwordResetService)
                .resetPasswordWithOTP(any(), any());

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn404_whenEmailNotFound() throws Exception {

        doThrow(new EmailNotFoundException("Email not found"))
                .when(passwordResetService)
                .resetPasswordWithOTP(any(), any());

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturn429_whenAccountLocked() throws Exception {

        doThrow(new AccountLockedException("Account locked"))
                .when(passwordResetService)
                .resetPasswordWithOTP(any(), any());

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void shouldReturn500_whenUnexpectedErrorOccurs() throws Exception {

        doThrow(new RuntimeException("Something broke"))
                .when(passwordResetService)
                .resetPasswordWithOTP(any(), any());

        mockMvc.perform(put(BASE_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asJson(validDto())))
                .andExpect(status().isInternalServerError());
    }
}
