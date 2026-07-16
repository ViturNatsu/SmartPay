package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.cardRequest.UserCardRequestController;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CreateCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserCardRequestController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserCardRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CardRequestService cardRequestService;

    @MockitoBean
    private JwtSessionService jwtSessionService;

    @MockitoBean
    private RequestCounter requestCounter;

    @MockitoBean
    private SessionService sessionService;

    @MockitoBean
    private UserService userService;


    private User user;
    private Authentication authentication;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("TestFirstName")
                .lastName("TestLastName")
                .build();

        authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(user);
    }

    @Test
    void requestNewCardOtp_returnsAccepted() throws Exception {
        mockMvc.perform(post("/api/v1/card-request/user/new-card/otp")
                        .principal(authentication))
                .andExpect(status().isAccepted());

        verify(cardRequestService).requestNewCardOtp(
                eq(user),
                ArgumentMatchers.any(HttpServletRequest.class)
        );
    }

    @Test
    void createNewCardRequest_returnsCreatedWithResponseBody() throws Exception {
        CreateCardRequestDTO requestDto = new CreateCardRequestDTO();
        requestDto.setAccessCode("1234567");
        requestDto.setConfirmed(true);

        CardRequestResponseDTO responseDto = new CardRequestResponseDTO(
                2L,
                "TestFirstName TestLastName",
                "6536",
                LocalDateTime.now().plusYears(2),
                1L,
                RequestStatus.PENDING,
                LocalDateTime.now(),
                "Card details is compromised",
                null
        );

        when(cardRequestService.createNewCardRequest(
                eq(user),
                ArgumentMatchers.any(CreateCardRequestDTO.class),
                ArgumentMatchers.any(HttpServletRequest.class)
        )).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/card-request/user/new-card")
                        .principal(authentication)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.requestId").value(2))
                .andExpect(jsonPath("$.userName").value("TestFirstName TestLastName"))
                .andExpect(jsonPath("$.cardLastFourDigits").value("6536"))
                .andExpect(jsonPath("$.previousRequestCount").value(1))
                .andExpect(jsonPath("$.requestStatus").value("PENDING"))
                .andExpect(jsonPath("$.requestReason").value("Card details is compromised"))
                .andExpect(jsonPath("$.denyReason").doesNotExist());

        verify(cardRequestService).createNewCardRequest(
                eq(user),
                ArgumentMatchers.any(CreateCardRequestDTO.class),
                ArgumentMatchers.any(HttpServletRequest.class)
        );
    }
}
