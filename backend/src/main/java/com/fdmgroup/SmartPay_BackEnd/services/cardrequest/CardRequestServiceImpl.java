package com.fdmgroup.SmartPay_BackEnd.services.cardrequest;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardrequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardrequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.cardrequest.CardRequestLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardrequest.CardRequestNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardrequest.InvalidCardRequestStatusException;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardrequest.CardRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CardRequestServiceImpl implements CardRequestService {
    private final CardRequestRepository cardRequestRepository;
    private final CardRepository cardRepository;

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
}
