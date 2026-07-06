package com.fdmgroup.SmartPay_BackEnd.controllerTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import com.fdmgroup.SmartPay_BackEnd.controllers.cardRequest.AdminCardRequestController;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;

import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminCardRequestController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminCardRequestControllerTest {

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

    private CardRequestResponseDTO buildDto(RequestStatus status) {
        return new CardRequestResponseDTO(
                1024L,
                "Test User",
                "2924",
                LocalDateTime.of(2028, 6, 9, 0, 0),
                1L,
                status,
                LocalDateTime.of(2026, 6, 9, 0, 0),
                "Card compromised",
                status == RequestStatus.DENIED ? "Insufficient information" : null
        );
    }

    @Test
    void getAllRequests_shouldReturnCardRequests() throws Exception {
        when(cardRequestService.getAllRequests())
                .thenReturn(List.of(buildDto(RequestStatus.PENDING)));

        mockMvc.perform(get("/api/v1/card-request/admin"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].requestId").value(1024))
                .andExpect(jsonPath("$[0].userName").value("Test User"))
                .andExpect(jsonPath("$[0].cardLastFourDigits").value("2924"))
                .andExpect(jsonPath("$[0].previousRequestCount").value(1))
                .andExpect(jsonPath("$[0].requestStatus").value("PENDING"));

        verify(cardRequestService).getAllRequests();
    }

    @Test
    void getPendingRequests_shouldReturnPendingCardRequests() throws Exception {
        when(cardRequestService.getPendingRequests())
                .thenReturn(List.of(buildDto(RequestStatus.PENDING)));

        mockMvc.perform(get("/api/v1/card-request/admin/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].requestId").value(1024))
                .andExpect(jsonPath("$[0].requestStatus").value("PENDING"));

        verify(cardRequestService).getPendingRequests();
    }

    @Test
    void getRequestById_shouldReturnCardRequest() throws Exception {
        when(cardRequestService.getRequestById(1024L))
                .thenReturn(buildDto(RequestStatus.PENDING));

        mockMvc.perform(get("/api/v1/card-request/admin/1024"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(1024))
                .andExpect(jsonPath("$.userName").value("Test User"))
                .andExpect(jsonPath("$.cardLastFourDigits").value("2924"))
                .andExpect(jsonPath("$.requestStatus").value("PENDING"));

        verify(cardRequestService).getRequestById(1024L);
    }

    @Test
    void approveRequest_shouldReturnApprovedRequest() throws Exception {
        when(cardRequestService.approveRequest(1024L))
                .thenReturn(buildDto(RequestStatus.APPROVED));

        mockMvc.perform(put("/api/v1/card-request/admin/1024/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(1024))
                .andExpect(jsonPath("$.requestStatus").value("APPROVED"));

        verify(cardRequestService).approveRequest(1024L);
    }

    @Test
    void denyRequest_shouldReturnDeniedRequest() throws Exception {
        String denyReason = "Insufficient information";

        when(cardRequestService.denyRequest(1024L, denyReason))
                .thenReturn(buildDto(RequestStatus.DENIED));

        mockMvc.perform(put("/api/v1/card-request/admin/1024/deny")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "denyReason": "Insufficient information"
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requestId").value(1024))
                .andExpect(jsonPath("$.requestStatus").value("DENIED"))
                .andExpect(jsonPath("$.denyReason").value("Insufficient information"));;

        verify(cardRequestService).denyRequest(1024L, denyReason);
    }
}
