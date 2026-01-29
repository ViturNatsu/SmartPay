package com.fdmgroup.SmartPay_BackEnd;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fdmgroup.SmartPay_BackEnd.controllers.AuthSessionController;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;

/**
 * US-F02-02-01 (Sign In)
 */
@WebMvcTest(AuthSessionController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private OtpService otpFlowService;

    @Test
    void login_returnsAccepted_whenCredentialsAreValid() throws Exception {

        User user = new User("test@smartpay.com", "encodedPassword");
        user.setEmailVerified(true);

        when(userService.validateCredentials("test@smartpay.com", "password123"))
                .thenReturn(user);

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                    {
                                      "email": "test@smartpay.com",
                                      "password": "password123"
                                    }
                                """))
                .andExpect(status().isAccepted())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.otpSent").value(true));

        verify(userService).validateCredentials("test@smartpay.com", "password123");
    }

    @Test
    void login_returnsClientError_whenCredentialsInvalid() throws Exception {

        when(userService.validateCredentials("test@smartpay.com", "wrongPassword"))
                .thenThrow(new IllegalArgumentException("Invalid credentials"));

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                    {
                                      "email": "test@smartpay.com",
                                      "password": "wrongPassword"
                                    }
                                """))
                .andExpect(status().isUnauthorized());

        verify(userService).validateCredentials("test@smartpay.com", "wrongPassword");
        verify(otpFlowService, never()).requestOtp(anyString(), org.mockito.ArgumentMatchers.any());
    }
}
