package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.card.CardController;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpRequestDto;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CardController.class)
@AutoConfigureMockMvc(addFilters = false)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ObjectMapper objectMapper;

    @MockitoBean
    private CardService cardService;

    @MockitoBean
    private OtpService otpService;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private UserService userService;

    private final String BASE_URL = "/api/v1/cards";

    @Test
    void shouldReturnCardSuccessfully_whenWalletIdExists() throws Exception {
        long walletId = 1L;

        LocalDateTime expiryDate = LocalDateTime.of(2028, 12, 31, 0, 0);

        CardResponseDTO cardResponseDTO = new CardResponseDTO(
                "1234567812345678",
                expiryDate,
                "123",
                CardStatus.ACTIVE
        );

        when(cardService.getCardByWalletId(walletId)).thenReturn(cardResponseDTO);


        mockMvc.perform(get(BASE_URL + "/" + walletId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.virtualCardNumber").value("1234567812345678"))
                .andExpect(jsonPath("$.CVV").value("123"));

        verify(cardService, times(1)).getCardByWalletId(walletId);
    }

    @Test
    void shouldReturn404_whenWalletIdDoesNotExist() throws Exception {
        long walletId = 999L;

        when(cardService.getCardByWalletId(walletId))
                .thenThrow(new WalletNotFoundException("Wallet with specified ID not found"));

        mockMvc.perform(get(BASE_URL + "/" + walletId))
                .andExpect(status().isNotFound());

        verify(cardService, times(1)).getCardByWalletId(walletId);
    }

    @Test
    void requestLock_shouldReturnAcceptedAndRequestOtpWhenValid() throws Exception {
        User user = new User("test@example.com", "Test@1234");
        user.setId(123L);

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );

        mockMvc.perform(post("/api/v1/cards/user/lock-requests")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                    {
                      "email":"test@example.com",
                      "type":"CARD_LOCK"
                    }
                    """))
                .andExpect(status().isAccepted());

        verify(cardService).lockSanityCheck(123L, EventType.CARD_LOCK);

        verify(otpService).requestOtp(
                eq("test@example.com"),
                eq(EventType.CARD_LOCK),
                any(HttpServletRequest.class)
        );
    }

    @ParameterizedTest
    @MethodSource("validEventTypes")
    void requestLock_shouldReturnBadRequest_whenTypeIsInvalid(EventType type) throws Exception {

        User user = new User("test@example.com", "Test@1234");
        user.setId(123L);

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );

        mockMvc.perform(post("/api/v1/cards/user/lock-requests")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                  "email":"test@example.com",
                  "type":"%s"
                }
                """.formatted(type.name())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(cardService);
        verifyNoInteractions(otpService);
    }

    static Stream<EventType> validEventTypes() {
        return Arrays.stream(EventType.values())
                .filter(type -> type != EventType.CARD_LOCK && type != EventType.CARD_UNLOCK);
    }
}