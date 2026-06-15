package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.wallet.WalletController;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.system.AuditService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;

@WebMvcTest(WalletController.class)
@AutoConfigureMockMvc(addFilters = false)
class WalletTransferControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WalletService walletService;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private AuditService auditService;

    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        User mockUser = User.builder()
                .id(1L)
                .email("test@smartpay.com")
                .role(Role.USER)
                .build();
        auth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
    }

    @Test
    void transfer_returns200_whenTransferIsValid() throws Exception {
        when(walletService.transfer(anyLong(), anyLong(), anyDouble(), any()))
                .thenReturn(new WalletResponseDTO());

        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 75.00,
                          "memo": "Dinner split"
                        }
                        """))
                .andExpect(status().isOk());

        verify(walletService).transfer(1L, 2L, 75.00, "Dinner split");
    }

    @Test
    void transfer_returns403_whenUserIdInPathDoesNotMatchToken() throws Exception {
        mockMvc.perform(post("/api/v1/wallets/99/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 75.00
                        }
                        """))
                .andExpect(status().isForbidden());

        verify(walletService, never()).transfer(anyLong(), anyLong(), anyDouble(), any());
    }

    @Test
    void transfer_returns422_whenAmountIsZero() throws Exception {
        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 0.00
                        }
                        """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void transfer_returns422_whenAmountExceedsMaximum() throws Exception {
        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 3001.00
                        }
                        """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void transfer_returns422_whenMemoContainsInvalidCharacters() throws Exception {
        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 50.00,
                          "memo": "hello@world!"
                        }
                        """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void transfer_returns422_whenMemoExceeds100Characters() throws Exception {
        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 50.00,
                          "memo": "%s"
                        }
                        """.formatted("A".repeat(101))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void transfer_returns422_whenInsufficientFunds() throws Exception {
        doThrow(new InsufficientFundsException("Insufficient wallet balance to complete this transfer."))
                .when(walletService).transfer(anyLong(), anyLong(), anyDouble(), any());

        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 500.00
                        }
                        """))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void transfer_returns200_whenMemoIsAbsent() throws Exception {
        when(walletService.transfer(anyLong(), anyLong(), anyDouble(), isNull()))
                .thenReturn(new WalletResponseDTO());

        mockMvc.perform(post("/api/v1/wallets/1/transfer")
                .principal(auth)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "recipientUserId": 2,
                          "amount": 50.00
                        }
                        """))
                .andExpect(status().isOk());
    }
}
