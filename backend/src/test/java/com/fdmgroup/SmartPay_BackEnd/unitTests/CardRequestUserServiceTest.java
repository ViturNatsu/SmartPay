package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CreateCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.InvalidCardRequestStatusException;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest.CardRequestRepository;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardRequestUserServiceTest {

    @Mock
    private CardRequestRepository cardRequestRepository;

    @Mock
    private CardRepository cardRepository;

    @Mock
    private OtpService otpService;

    @Mock
    private HttpServletRequest httpRequest;

    @InjectMocks
    private CardRequestServiceImpl cardRequestService;

    private User user;
    private Card card;
    private CreateCardRequestDTO dto;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("TestFirstName")
                .lastName("TestLastName")
                .build();

        card = new Card();
        card.setCardId(10L);
        card.setCardNumber("1234567890126536");
        card.setStatus(CardStatus.ACTIVE);
        card.setExpirationDate(LocalDateTime.now().plusYears(2));

        dto = new CreateCardRequestDTO();
        dto.setAccessCode("1234567");
        dto.setConfirmed(true);
    }

    @Test
    void requestNewCardOtp_success_sendsOtp() {
        when(cardRepository.findCardByUserId(user.getId())).thenReturn(Optional.of(card));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(eq(user), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING))
                .thenReturn(false);

        cardRequestService.requestNewCardOtp(user, httpRequest);

        verify(otpService).requestOtp(user.getEmail(), EventType.REQUEST_NEW_CARD, httpRequest);
    }

    @Test
    void createNewCardRequest_success_createsPendingRequestAndLocksCard() {
        Otp otp = new Otp(user.getEmail(), EventType.REQUEST_NEW_CARD);
        otp.setStatus(Otp.OtpStatus.ACTIVE);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(10));

        when(cardRepository.findCardByUserId(user.getId())).thenReturn(Optional.of(card));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(eq(user), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING))
                .thenReturn(false);
        when(otpService.verifyOtp(any(), eq(httpRequest))).thenReturn(otp);

        when(cardRequestRepository.save(any(CardRequest.class))).thenAnswer(invocation -> {
            CardRequest saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        CardRequestResponseDTO response = cardRequestService.createNewCardRequest(
                user,
                dto,
                httpRequest
        );

        assertNotNull(response);
        assertEquals(2L, response.getRequestId());
        assertEquals(RequestStatus.PENDING, response.getRequestStatus());
        assertEquals("6536", response.getCardLastFourDigits());

        assertEquals(CardStatus.LOCKED, card.getStatus());

        verify(otpService).verifyOtp(any(), eq(httpRequest));
        verify(cardRepository).save(card);
        verify(cardRequestRepository).save(any(CardRequest.class));
        verify(otpService).save(otp);
        assertTrue(otp.isUsed());
    }

    @Test
    void createNewCardRequest_confirmedFalse_throwsException() {
        dto.setConfirmed(false);

        assertThrows(
                InvalidCardRequestStatusException.class,
                () -> cardRequestService.createNewCardRequest(user, dto, httpRequest)
        );

        verifyNoInteractions(otpService);
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
        verify(cardRepository, never()).save(any(Card.class));
    }

    @Test
    void createNewCardRequest_pendingRequestExists_throwsException() {
        when(cardRepository.findCardByUserId(user.getId())).thenReturn(Optional.of(card));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(eq(user), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING))
                .thenReturn(true);

        assertThrows(
                InvalidCardRequestStatusException.class,
                () -> cardRequestService.createNewCardRequest(user, dto, httpRequest)
        );

        verify(otpService, never()).verifyOtp(any(), any());
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void createNewCardRequest_requestLimitReached_throwsException() {
        when(cardRepository.findCardByUserId(user.getId())).thenReturn(Optional.of(card));
        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(eq(user), any(LocalDateTime.class)))
                .thenReturn(4L);

        assertThrows(
                CardRequestLimitExceededException.class,
                () -> cardRequestService.createNewCardRequest(user, dto, httpRequest)
        );

        verify(otpService, never()).verifyOtp(any(), any());
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
    }

    @Test
    void createNewCardRequest_invalidOtp_doesNotCreateRequestOrLockCard() {
        when(cardRepository.findCardByUserId(user.getId()))
                .thenReturn(Optional.of(card));

        when(cardRequestRepository.countByUserAndRequestCreatedAtAfter(eq(user), any(LocalDateTime.class)))
                .thenReturn(0L);

        when(cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING))
                .thenReturn(false);

        when(otpService.verifyOtp(any(OtpDTO.class), eq(httpRequest)))
                .thenThrow(new AccessCodeMismatchException("This code is invalid. Please verify the code and try again."));

        assertThrows(
                AccessCodeMismatchException.class,
                () -> cardRequestService.createNewCardRequest(user, dto, httpRequest)
        );

        assertEquals(CardStatus.ACTIVE, card.getStatus());

        verify(otpService).verifyOtp(any(OtpDTO.class), eq(httpRequest));
        verify(cardRepository, never()).save(any(Card.class));
        verify(cardRequestRepository, never()).save(any(CardRequest.class));
        verify(otpService, never()).save(any(Otp.class));
    }
}
