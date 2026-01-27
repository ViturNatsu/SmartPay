package com.fdmgroup.SmartPay_BackEnd;

import com.fdmgroup.SmartPay_BackEnd.controllers.AuthController;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * US-F02-02-01 (Sign In)
 */
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    void login_returnsJwtToken_whenCredentialsAreValid() throws Exception {

        when(userService.validateCredentials("test@smartpay.com", "password123"))
                .thenReturn(new User("test@smartpay.com", "encodedPassword"));

        when(jwtService.generateToken("test@smartpay.com"))
                .thenReturn("fake.jwt.token");

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                    {
                                      "email": "test@smartpay.com",
                                      "password": "password123"
                                    }
                                """)
                )
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("fake.jwt.token"));

        verify(userService).validateCredentials("test@smartpay.com", "password123");
        verify(jwtService).generateToken("test@smartpay.com");
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
                                """)
                )
                .andExpect(status().is4xxClientError());

        verify(userService).validateCredentials("test@smartpay.com", "wrongPassword");
        verify(jwtService, never()).generateToken(anyString());
    }
}
