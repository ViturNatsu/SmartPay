package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.card.CardController;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CardController.class)
@AutoConfigureMockMvc(addFilters = false)
class CardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardService cardService;

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
                "123"
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


}