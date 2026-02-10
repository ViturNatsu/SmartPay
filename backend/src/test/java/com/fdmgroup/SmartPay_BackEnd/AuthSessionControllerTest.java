package com.fdmgroup.SmartPay_BackEnd;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
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
import com.fdmgroup.SmartPay_BackEnd.exception.SessionAuthenticationException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;

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
        private HttpServletRequest httpServletRequest;

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
                verify(otpFlowService, never()).requestOtp(anyString(), any(), any(HttpServletRequest.class));
        }

        @Test
        void refresh_returnsOk_andRotatesTokens_whenRefreshTokenIsValid() throws Exception {
                String oldRefresh = "oldRefreshToken";
                String newAccess = "newAccessToken";
                String newRefresh = "newRefreshToken";

                User user = new User("test@smartpay.com", "encodedPassword");
                user.setId(1L);

                when(jwtSessionService.isTokenValid(oldRefresh)).thenReturn(true);
                when(jwtSessionService.isRefreshToken(oldRefresh)).thenReturn(true);
                when(jwtSessionService.getUserIdFromToken(oldRefresh)).thenReturn(1L);
                when(userService.getUserById(1L)).thenReturn(user);
                when(jwtSessionService.createAccessToken(user)).thenReturn(newAccess);
                when(jwtSessionService.createRefreshToken(user)).thenReturn(newRefresh);

                mockMvc.perform(
                                post("/api/v1/auth/refresh")
                                                .header("Authorization", "Bearer " + oldRefresh))
                                .andExpect(status().isOk())
                                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                                .andExpect(jsonPath("$.accessToken").value(newAccess))
                                .andExpect(jsonPath("$.refreshToken").value(newRefresh));

                verify(sessionService).validateSession(oldRefresh);
                verify(sessionService).rotateRefreshToken(oldRefresh, newRefresh);
        }

        @Test
        void refresh_returnsUnauthorized_whenTokenIsInvalid() throws Exception {
                String badToken = "invalidToken";

                when(jwtSessionService.isTokenValid(badToken)).thenReturn(false);

                mockMvc.perform(
                                post("/api/v1/auth/refresh")
                                                .header("Authorization", "Bearer " + badToken))
                                .andExpect(status().isUnauthorized());

                // sessionService should not be called when token is invalid
                verify(sessionService, never()).validateSession(anyString());
        }

        @Test
        void session_refresh_throwsSessionAuthenticationException_whenSessionIsInvalid() throws Exception {
                String invalidRefresh = "invalidRefresh";

                when(jwtSessionService.isTokenValid(invalidRefresh)).thenReturn(true);
                when(jwtSessionService.isRefreshToken(invalidRefresh)).thenReturn(true);
                // validation will throw the session auth exception
                doThrow(new SessionAuthenticationException("invalid session"))
                                .when(sessionService).validateSession(invalidRefresh);

                mockMvc.perform(
                                post("/api/v1/auth/refresh")
                                                .header("Authorization", "Bearer " + invalidRefresh))
                                .andExpect(status().isUnauthorized());

                verify(sessionService).validateSession(invalidRefresh);
        }

}
