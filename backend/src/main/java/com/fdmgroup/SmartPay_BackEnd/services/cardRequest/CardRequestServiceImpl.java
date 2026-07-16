package com.fdmgroup.SmartPay_BackEnd.services.cardRequest;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CreateCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.InvalidCardRequestStatusException;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest.CardRequestRepository;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CardRequestServiceImpl implements CardRequestService {
    private final CardRequestRepository cardRequestRepository;
    private final CardRepository cardRepository;
    private final OtpService otpService;

    @Autowired
    private GenerateStringsHelper helper;



    /**
     * Fetches all card requests from the database
     * @return A list of CardRequestResponseDTO objects representing all card requests
     */
    @Override
    public List<CardRequestResponseDTO> getAllRequests() {
        return cardRequestRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }


    /**
     * Fetches all pending card requests from the database
     * @return A list of pending CardRequestResponseDTO objects representing all card requests
     */
    @Override
    public List<CardRequestResponseDTO> getPendingRequests() {
        return cardRequestRepository.findByRequestStatus(RequestStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    /**
     * Fetches a card request by its request id
     * @param requestId the id of the card request to retrieve
     * @return The CardRequestResponseDTO which is a limited view of the CardRequest data structure
     */
    @Override
    public CardRequestResponseDTO getRequestById(Long requestId) {
        CardRequest cardRequest = cardRequestRepository.findById(requestId)
                .orElseThrow(() -> new CardRequestNotFoundException("Card request not found"));

        return mapToDto(cardRequest);
    }

    /**
     * Approves a pending card request, regenerates the linked card details
     * and updates the request status to APPROVED.
     * @param requestId the id of the card request to approve
     * @return The CardRequestResponseDTO which is a limited view of the approved card request
     */
    @Override
    public CardRequestResponseDTO approveRequest(Long requestId) {
        CardRequest cardRequest = cardRequestRepository.findById(requestId)
                .orElseThrow(() -> new CardRequestNotFoundException("Card request not found"));

        if (cardRequest.getRequestStatus() != RequestStatus.PENDING) {
            throw new InvalidCardRequestStatusException("Only pending requests can be approved");
        }

        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        long requestCount = cardRequestRepository.countByUserAndRequestCreatedAtAfter(
                cardRequest.getUser(),
                oneYearAgo
        );

        if (requestCount > 4) {
            throw new CardRequestLimitExceededException("User has exceeded the limit of 4 requests per year");
        }

        // Approving a request should unlock/reactivate the card after regeneration.
        generateAndSaveCard(cardRequest);
        CardRequest savedRequest = cardRequestRepository.save(cardRequest);

        return mapToDto(savedRequest);
    }

    /**
     * Denies a pending card request without changing the linked card details
     * @param requestId the id of the card request to deny
     * @return The CardRequestResponseDTO which is a limited view of the denied card request
     */
    @Override
    public CardRequestResponseDTO denyRequest(Long requestId,  String denyReason) {
        CardRequest cardRequest = cardRequestRepository.findById(requestId)
                .orElseThrow(() -> new CardRequestNotFoundException("Card request not found"));

        if (cardRequest.getRequestStatus() != RequestStatus.PENDING) {
            throw new InvalidCardRequestStatusException("Only pending requests can be denied");
        }

        cardRequest.setRequestStatus(RequestStatus.DENIED);
        cardRequest.setRequestResolvedAt(LocalDateTime.now());
        cardRequest.setDenyReason(denyReason);

        CardRequest savedRequest = cardRequestRepository.save(cardRequest);

        return mapToDto(savedRequest);
    }

    /**
     * Regenerates the card details for an approved card request and saves the updated card
     * The card request status is also updated to APPROVED with a resolved timestamp
     * @param cardRequest the card request containing the card to regenerate.
     */
    private void generateAndSaveCard(CardRequest cardRequest) {
        Card card = cardRequest.getCard();

        card.setCardNumber(helper.generateCardNumber());
        card.setCvv(helper.generateCVV());
        card.setExpirationDate(helper.generateExpiryDate());

        //approved regenerated cards are set to ACTIVE.
        card.setStatus(CardStatus.ACTIVE);

        cardRequest.setRequestStatus(RequestStatus.APPROVED);
        cardRequest.setRequestResolvedAt(LocalDateTime.now());

        cardRepository.save(card);
    }

    /**
     * Maps a CardRequest object into its respective CardRequestResponseDTO
     * @param cardRequest The cardRequest object that the CardRequestResponseDTO is based on.
     * @return The CardRequestResponseDTO which is a limited view of the CardRequestResponse data structure
     */
    private CardRequestResponseDTO mapToDto(CardRequest cardRequest) {
        User user = cardRequest.getUser();
        Card card = cardRequest.getCard();

        String userName = user.getFirstName() + " " + user.getLastName();

        String cardNumber = card.getCardNumber();
        String lastFourDigits = cardNumber.substring(cardNumber.length() - 4);

        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
        long previousRequestCount = cardRequestRepository.countByUserAndRequestCreatedAtAfter(
                user,
                oneYearAgo
        );

        return new CardRequestResponseDTO(
                cardRequest.getId(),
                userName,
                lastFourDigits,
                card.getExpirationDate(),
                previousRequestCount,
                cardRequest.getRequestStatus(),
                cardRequest.getRequestCreatedAt(),
                cardRequest.getRequestReason(),
                cardRequest.getDenyReason()
        );
    }

    /**
     * request for OTP verification for card regeneration
     */
    @Override
    public void requestNewCardOtp(User user, HttpServletRequest httpRequest) {
        // check whether user is eligible before sending OTP
        Card card = getCardForUser(user);
        validateNewCardRequestEligibility(user, card);

        otpService.requestOtp(
                user.getEmail(),
                EventType.REQUEST_NEW_CARD,
                httpRequest
        );
    }

    /**
     * Verify a card regenerate request and save it in database
     * @param user, createCardRequestDTO, HttpServletRequest
     * @return The CardRequestResponseDTO which is the
     */
    @Override
    @Transactional
    public CardRequestResponseDTO createNewCardRequest(User user, CreateCardRequestDTO dto, HttpServletRequest httpRequest) {
        if (!dto.isConfirmed()) {
            throw new InvalidCardRequestStatusException("User must confirm before requesting a new card");
        }

        Card card = getCardForUser(user);
        validateNewCardRequestEligibility(user, card);

        Otp otpEntity = otpService.verifyOtp(new OtpDTO(user.getEmail(), dto.getAccessCode(),
                EventType.REQUEST_NEW_CARD), httpRequest);

        //when making regenerate request, the card is automatically locked
        card.setStatus(CardStatus.LOCKED);
        cardRepository.save(card);

        CardRequest cardRequest = new CardRequest();
        cardRequest.setUser(user);
        cardRequest.setCard(card);
        cardRequest.setRequestStatus(RequestStatus.PENDING);
        cardRequest.setRequestCreatedAt(LocalDateTime.now());
        // no request reason input text form on the wireframe, so set this to default reason for now
        cardRequest.setRequestReason("Card details is compromised");
        CardRequest savedRequest = cardRequestRepository.save(cardRequest);

        otpEntity.markAsUsed();
        otpService.save(otpEntity);

        return mapToDto(savedRequest);
    }

    /**
     * helper method to get card for user
     * @param user the user who owns the card
     * @return the card linked to user
     */
    private Card getCardForUser(User user) {
        return cardRepository.findCardByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Card not found for user"));
    }

    /**
     * helper method to check if this user is valid to make card regenerate request
     * @param user, card
     */
    private void validateNewCardRequestEligibility(User user, Card card) {
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        long requestCount = cardRequestRepository.countByUserAndRequestCreatedAtAfter(user, oneYearAgo);
        if (requestCount >= 4) {
            throw new CardRequestLimitExceededException("User has exceeded the limit of 4 requests per year");
        }

        boolean hasPendingRequest = cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING);
        if (hasPendingRequest) {
            throw new InvalidCardRequestStatusException("A pending card request already exists");
        }
    }
}
