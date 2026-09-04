package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.InvalidCardRequestStatusException;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest.CardRequestRepository;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestServiceImpl;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class AdminCardRequestServiceTest {
    @Mock
    private CardRequestRepository cardRequestRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private GenerateStringsHelper helper;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private CardRequestServiceImpl cardRequestService;

    private User user;
    private Card card;
    private CardRequest pendingRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("plaintext")
                .firstName("Test")
                .lastName("User")
                .build();

        card = new Card();
        card.setCardId(1L);
        card.setCardNumber("6400658875152924");
        card.setCvv("123");
        card.setExpirationDate(LocalDateTime.of(2028, 6, 9, 0, 0));
        card.setStatus(CardStatus.ACTIVE);

        pendingRequest = new CardRequest();
        pendingRequest.setId(1024L);
        pendingRequest.setUser(user);
        pendingRequest.setCard(card);
        pendingRequest.setRequestStatus(RequestStatus.PENDING);
        pendingRequest.setRequestCreatedAt(LocalDateTime.now());
        pendingRequest.setRequestResolvedAt(null);
    }

    @Test
    void getAllRequests_shouldReturnMappedDtos() {
        when(cardRequestRepository.findAll()).thenReturn(List.of(pendingRequest));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);

        List<CardRequestResponseDTO> result = cardRequestService.getAllRequests();

        assertEquals(1, result.size());
        assertEquals(1024L, result.get(0).getRequestId());
        assertEquals("Test User", result.get(0).getUserName());
        assertEquals("2924", result.get(0).getCardLastFourDigits());
        assertEquals(RequestStatus.PENDING, result.get(0).getRequestStatus());

        verify(cardRequestRepository).findAll();
    }

    @Test
    void getPendingRequests_shouldReturnPendingRequestDtos() {
        when(cardRequestRepository.findByRequestStatus(RequestStatus.PENDING))
                .thenReturn(List.of(pendingRequest));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);

        List<CardRequestResponseDTO> result = cardRequestService.getPendingRequests();

        assertEquals(1, result.size());
        assertEquals(RequestStatus.PENDING, result.get(0).getRequestStatus());

        verify(cardRequestRepository).findByRequestStatus(RequestStatus.PENDING);
    }

    @Test
    void getRequestById_shouldReturnRequestDto() {
        when(cardRequestRepository.findById(1024L)).thenReturn(Optional.of(pendingRequest));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);

        CardRequestResponseDTO result = cardRequestService.getRequestById(1024L);

        assertEquals(1024L, result.getRequestId());
        assertEquals("Test User", result.getUserName());
        assertEquals("2924", result.getCardLastFourDigits());

        verify(cardRequestRepository).findById(1024L);
    }

    @Test
    void getRequestById_shouldThrowWhenRequestIdDoesNotExist() {
        Long requestId = 999L;

        when(cardRequestRepository.findById(requestId))
                .thenReturn(Optional.empty());

        CardRequestNotFoundException exception = assertThrows(
                CardRequestNotFoundException.class,
                () -> cardRequestService.getRequestById(requestId)
        );

        assertEquals("Card request not found", exception.getMessage());

        verify(cardRequestRepository).findById(requestId);
    }

    @Test
    void approveRequest_shouldApproveRequestAndRegenerateCard() {
        when(cardRequestRepository.findById(1024L)).thenReturn(Optional.of(pendingRequest));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);

        when(helper.generateCardNumber()).thenReturn("6400428690396428");
        when(helper.generateCVV()).thenReturn("840");
        when(helper.generateExpiryDate()).thenReturn(LocalDateTime.of(2028, 6, 9, 13, 54));

        when(cardRequestRepository.save(pendingRequest)).thenReturn(pendingRequest);

        CardRequestResponseDTO result = cardRequestService.approveRequest(1024L);

        assertEquals(RequestStatus.APPROVED, pendingRequest.getRequestStatus());
        assertNotNull(pendingRequest.getRequestResolvedAt());

        assertEquals("6400428690396428", card.getCardNumber());
        assertEquals("840", card.getCvv());
        assertEquals(CardStatus.ACTIVE, card.getStatus());

        assertEquals(RequestStatus.APPROVED, result.getRequestStatus());
        assertEquals("6428", result.getCardLastFourDigits());

        verify(cardRepository).save(card);
        verify(cardRequestRepository).save(pendingRequest);
    }

    @Test
    void approveRequest_notifiesCardDetailsChanged_forReplacementCardSource() {
        when(cardRequestRepository.findById(1024L)).thenReturn(Optional.of(pendingRequest));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);
        when(helper.generateCardNumber()).thenReturn("6400428690396428");
        when(helper.generateCVV()).thenReturn("840");
        when(helper.generateExpiryDate()).thenReturn(LocalDateTime.of(2028, 6, 9, 13, 54));
        when(cardRequestRepository.save(pendingRequest)).thenReturn(pendingRequest);

        cardRequestService.approveRequest(1024L);

        // Scenario 4 — replacement card issued on approval is the second source of the card-change event.
        verify(notificationService).createFromEventSafely(
                eq(NotificationEventType.CARD_DETAILS_CHANGED), eq(1L), eq(1L),
                any(NotificationEventContext.class));
    }

    @Test
    void approveRequest_shouldThrowWhenRequestIdDoesNotExist() {
        Long requestId = 999L;

        when(cardRequestRepository.findById(requestId))
                .thenReturn(Optional.empty());

        CardRequestNotFoundException exception = assertThrows(
                CardRequestNotFoundException.class,
                () -> cardRequestService.approveRequest(requestId)
        );

        assertEquals("Card request not found", exception.getMessage());

        verify(cardRequestRepository).findById(requestId);
        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void approveRequest_shouldThrowWhenRequestIsNotPending() {
        pendingRequest.setRequestStatus(RequestStatus.APPROVED);

        when(cardRequestRepository.findById(1024L))
                .thenReturn(Optional.of(pendingRequest));

        InvalidCardRequestStatusException exception = assertThrows(
                InvalidCardRequestStatusException.class,
                () -> cardRequestService.approveRequest(1024L)
        );

        assertEquals("Only pending requests can be approved", exception.getMessage());

        verify(helper, never()).generateCardNumber();
        verify(helper, never()).generateCVV();
        verify(helper, never()).generateExpiryDate();
        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void approveRequest_shouldThrowWhenUserHasReachedRequestLimit() {
        when(cardRequestRepository.findById(1024L))
                .thenReturn(Optional.of(pendingRequest));

        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(
                any(User.class),
                any(LocalDateTime.class)
        )).thenReturn(5L);

        CardRequestLimitExceededException exception = assertThrows(
                CardRequestLimitExceededException.class,
                () -> cardRequestService.approveRequest(1024L)
        );

        assertEquals("User has exceeded the limit of 4 requests per year", exception.getMessage());

        verify(helper, never()).generateCardNumber();
        verify(helper, never()).generateCVV();
        verify(helper, never()).generateExpiryDate();

        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void denyRequest_shouldDenyRequestWithoutRegeneratingCard() {
        when(cardRequestRepository.findById(1024L)).thenReturn(Optional.of(pendingRequest));
        when(cardRequestRepository.save(pendingRequest)).thenReturn(pendingRequest);
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(any(User.class), any(LocalDateTime.class)))
                .thenReturn(1L);

        CardRequestResponseDTO result = cardRequestService.denyRequest(1024L, "Insufficient information");

        assertEquals(RequestStatus.DENIED, pendingRequest.getRequestStatus());
        assertNotNull(pendingRequest.getRequestResolvedAt());

        assertEquals("6400658875152924", card.getCardNumber());
        assertEquals("123", card.getCvv());
        assertEquals(RequestStatus.DENIED, result.getRequestStatus());

        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository).save(pendingRequest);
    }

    @Test
    void denyRequest_shouldThrowWhenRequestIdDoesNotExist() {
        Long requestId = 999L;

        when(cardRequestRepository.findById(requestId))
                .thenReturn(Optional.empty());

        CardRequestNotFoundException exception = assertThrows(
                CardRequestNotFoundException.class,
                () -> cardRequestService.denyRequest(requestId, "Insufficient information")
        );

        assertEquals("Card request not found", exception.getMessage());

        verify(cardRequestRepository).findById(requestId);
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void denyRequest_shouldThrowWhenRequestIsNotPending() {
        pendingRequest.setRequestStatus(RequestStatus.APPROVED);

        when(cardRequestRepository.findById(1024L))
                .thenReturn(Optional.of(pendingRequest));

        InvalidCardRequestStatusException exception = assertThrows(
                InvalidCardRequestStatusException.class,
                () -> cardRequestService.denyRequest(1024L, "Insufficient information")
        );

        assertEquals("Only pending requests can be denied", exception.getMessage());

        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }




}
