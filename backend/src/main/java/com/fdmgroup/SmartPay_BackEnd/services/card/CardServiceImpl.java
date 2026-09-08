package com.fdmgroup.SmartPay_BackEnd.services.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardStatusOperationNotAllowedException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardUnauthorizedAccessException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest.CardRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationEventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.integration.EmailService;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class CardServiceImpl implements CardService {
    private final CardRepository cardRepository;
    private final CardRequestRepository cardRequestRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Autowired
    private GenerateStringsHelper helper;

    /**
     * Creates and links a card, given a wallet object
     * @param wallet the wallet object that the card will be linked to
     * @return The CardResponseDTO which is a limited view of the Card data structure
     */
    @Override
    public CardResponseDTO createCard(Wallet wallet) {
        Card card = new Card();

        // Defining the card generation algorithm
        String cardNumber = helper.generateCardNumber();
        LocalDateTime expiryDate = helper.generateExpiryDate();
        String CVV = helper.generateCVV();

        card.setCardNumber(cardNumber);
        card.setExpirationDate(expiryDate);
        card.setCvv(CVV);
        card.setWallet(wallet);
        card.setStatus(CardStatus.ACTIVE);

        cardRepository.save(card);

        return mapToDto(card);
    }

    /**
     * Fetches the card in the database using the associated wallet id.
     * @param id the wallet id linked with the card.
     * @return The CardResponseDTO which is a limited view of the Card data structure
     */
    @Override
    public CardResponseDTO getCardByWalletId(Long id) {

        Card card = cardRepository.findByWalletWalletId(id);
        if (card == null) {
            throw new WalletNotFoundException("Wallet with specified ID not found");
        }

        return mapToDto(card);

    }

    /**
     * Checks if the card linked to the wallet id is expired, and if so, renews the card by generating a new expiry date and CVV.
     * @param walletId the wallet id linked with the card.
     * @return true if the card was renewed, false if the card was not expired and thus not renewed.
     */
    @Transactional
    @Override
    public boolean renewIfExpired(Long walletId) {
        Card card = cardRepository.findByWalletWalletId(walletId);
        if (card == null) {
            throw new WalletNotFoundException("Wallet with specified ID not found");
        }
        if (!isExpired(card)){
            return false;
        }

        LocalDateTime newExpiry = updateExpiryDate(card);
        updateCvv(card);
        cardRepository.save(card);

        // Send notification email to user about card renewal
        EmailDetails details = new EmailDetails();
        details.setRecipient(card.getWallet().getUser().getEmail());
        details.setSubject("Your Card Has Been Renewed");

        details.setMsgBody("Dear " + card.getWallet().getUser().getFirstName() +
        ",\n\nYour card ending with " + card.getCardNumber().substring(card.getCardNumber().length() - 4) +
        " has been renewed successfully. Your new expiration date is " + newExpiry.toLocalDate() +
        ".\n\nThank you for using SmartPay!");

        emailService.sendSimpleMail(details);

        // Scenario 4 — card details changed (CVV/expiry regenerated). Routed through the shared
        // service; the message carries only the last four digits, never the CVV or full number, and
        // links to the affected card (the wallet view reveals details under the 09-02-03 rules).
        String cardNumber = card.getCardNumber();
        String lastFour = cardNumber != null && cardNumber.length() >= 4
                ? cardNumber.substring(cardNumber.length() - 4)
                : null;
        notificationService.createFromEventSafely(
                NotificationEventType.CARD_DETAILS_CHANGED,
                card.getWallet().getUser().getId(),
                card.getCardId(),
                NotificationEventContext.builder().cardLastFour(lastFour).build());

        return true;
    }

    // Helper methods for card renewal
    private boolean isExpired(Card card) {
        return card.getExpirationDate().isBefore(LocalDateTime.now());
    }

    // Helper method to update the expiry date of a card. Returns the new expiry date.
    private LocalDateTime updateExpiryDate(Card card) {
        LocalDateTime newExpiry = helper.generateExpiryDate();
        card.setExpirationDate(newExpiry);
        return newExpiry;
    }

    // Helper method to update the CVV of a card. Ensures that the new CVV is different from the old CVV.
    private void updateCvv(Card card) {
        String newCvv;
        do {
            newCvv = helper.generateCVV();
        } while (card.getCvv().equals(newCvv));
        card.setCvv(newCvv);
    }
    /**
     * Retrieves a card associated with the specified user ID.
     *
     * @param userId the ID of the user whose card is being retrieved
     * @return a {@link CardResponseDTO} containing the card details
     * @throws CardNotFoundException if no card is associated with the specified user
     */
    @Override
    public CardResponseDTO getCardByUserId(Long userId) {
        Card card = cardRepository.findCardByUserId(userId).orElseThrow(CardNotFoundException::new);
        return  mapToDto(card);
    }

    /**
     * Changes the status of a card associated with the specified user ID
     * based on the provided card-related event.
     * <p>
     * Supported events:
     * <ul>
     *     <li>{@link EventType#CARD_LOCK} - Locks the card</li>
     *     <li>{@link EventType#CARD_UNLOCK} - Unlocks the card</li>
     * </ul>
     *
     * @param userId the ID of the user whose card status is to be changed
     * @param eventType the card status change event
     * @throws CardStatusOperationNotAllowedException if the event type is unsupported
     *                                                or the operation is not permitted
     * @throws CardNotFoundException if no card is associated with the specified user
     */
    @Override
    public void changeCardStatusByUserId(Long userId, EventType eventType) {
        if(EventType.CARD_LOCK ==  eventType) {
            lockCardByUserId(userId);
        }
        else if(EventType.CARD_UNLOCK ==  eventType) {
            unlockCardByUserId(userId);
        }
        else{
            //This is typically unreachable. To ensure it doesn't silently break, an error is thrown.
            throw new CardStatusOperationNotAllowedException("Card Status Operation Not Allowed");
        }
    }

    /**
     * Performs validation before attempting a card lock or unlock operation.
     * <p>
     * Validation rules:
     * <ul>
     *     <li>A card can only be locked when its status is {@link CardStatus#ACTIVE}</li>
     *     <li>A card can only be unlocked when its status is {@link CardStatus#LOCKED}</li>
     * </ul>
     *
     * @param userId the ID of the user whose card status is being validated
     * @param eventType the intended card status change event
     * @throws CardNotFoundException if no card is associated with the specified user
     * @throws CardStatusOperationNotAllowedException if the current card status
     *                                                does not allow the requested operation
     */
    @Override
    public void lockSanityCheck(Long userId, EventType eventType) {
        Card card = cardRepository.findCardByUserId(userId).orElseThrow(CardNotFoundException::new);
        if(eventType == EventType.CARD_LOCK) {
            if(card.getStatus() != CardStatus.ACTIVE) {
                throw new  CardStatusOperationNotAllowedException("Card status is not ACTIVE");
            }
        }
        if(eventType == EventType.CARD_UNLOCK) {
            if(card.getStatus() != CardStatus.LOCKED) {
                throw new  CardStatusOperationNotAllowedException("Card status is not LOCKED");
            }
            if(cardRequestRepository.existsByCardAndRequestStatus(card, RequestStatus.PENDING)){
                throw new  CardStatusOperationNotAllowedException("This Card has a pending request for renewal, and cannot be unlocked.");
            }
        }
    }


    // Helper methods for locking and unlocking a card through the associated User id. This operation requires multiple SQL JOINs.
    /**
     * Locks the card associated with the specified user ID.
     *
     * @param userId the ID of the user whose card is to be locked
     * @throws CardNotFoundException if no card is associated with the specified user
     * @throws CardStatusOperationNotAllowedException if the card is not in an ACTIVE state
     */
    private void lockCardByUserId(Long userId) {
        Card card = cardRepository.findCardByUserId(userId).orElseThrow(CardNotFoundException::new);
        performLock(card);
    }

    /**
     * Unlocks the card associated with the specified user ID.
     *
     * @param userId the ID of the user whose card is to be unlocked
     * @throws CardNotFoundException if no card is associated with the specified user
     * @throws CardStatusOperationNotAllowedException if the card is not in a LOCKED state
     */
    private void unlockCardByUserId(Long userId) {
        Card card = cardRepository.findCardByUserId(userId).orElseThrow(CardNotFoundException::new);
        performUnlock(card);
    }

    // Helper methods for locking and unlocking a card through its Card id.
    // Might be useful in the future.
    // Currently not used.

    /**
     * Locks the card identified by the specified card ID.
     * <p>
     * Currently unused, but retained for potential future functionality.
     *
     * @param cardId the ID of the card to lock
     * @throws CardNotFoundException if the card does not exist
     * @throws CardStatusOperationNotAllowedException if the card is not in an ACTIVE state
     */
    private void lockCardByCardId(Long cardId){
        Card card = cardRepository.findById(cardId).orElseThrow(CardNotFoundException::new);
        performLock(card);
    }

    /**
     * Unlocks the card identified by the specified card ID.
     * <p>
     * Currently unused, but retained for potential future functionality.
     *
     * @param cardId the ID of the card to unlock
     * @throws CardNotFoundException if the card does not exist
     * @throws CardStatusOperationNotAllowedException if the card is not in a LOCKED state
     */
    private void unlockCardByCardId(Long cardId){
        Card card = cardRepository.findById(cardId).orElseThrow(CardNotFoundException::new);
        performUnlock(card);
    }

    /**
     * Performs the card locking operation.
     * <p>
     * A card may only be locked if its current status is {@link CardStatus#ACTIVE}.
     *
     * @param card the card to lock
     * @throws CardStatusOperationNotAllowedException if the card is not ACTIVE
     */
    // The actual process of locking/unlocing a card.
    private void performLock(Card card) {
        // A card must first be active to be locked
        if(card.getStatus() == CardStatus.ACTIVE){
            card.setStatus(CardStatus.LOCKED);
        }else{
            throw new CardStatusOperationNotAllowedException("Lock not allowed. The card's status must first be ACTIVE.");
        }
        cardRepository.save(card);
    }

    /**
     * Performs the card unlocking operation.
     * <p>
     * Unlocking returns a card to the {@link CardStatus#ACTIVE} state.
     * Only cards currently in the {@link CardStatus#LOCKED} state may be unlocked.
     *
     * @param card the card to unlock
     * @throws CardStatusOperationNotAllowedException if the card is not LOCKED
     */
    private void performUnlock(Card card) {
        // "Unlocking" a card returns it to the active state.
        // However, we only allow unlocking a "LOCKED" card. Inactive cards are, for now, considered as no longer in-use.
        // The CardStatus will have to be refined further to allow handling of more complex statuses.
        if(card.getStatus().equals(CardStatus.LOCKED)){
            card.setStatus(CardStatus.ACTIVE);
        }else{
            throw new CardStatusOperationNotAllowedException("Unlock not allowed. The card's status must first be LOCKED.");
        }
        cardRepository.save(card);
    }
    /**
     * Maps a Card object into its respective CardResponseDTO
     * @param card The card object that the CardResponseDTO is based on.
     * @return The CardResponseDTO which is a limited view of the Card data structure
     */
    // Note: Ideally, there are mapper classes
    private CardResponseDTO mapToDto(Card card){
        CardResponseDTO response = new CardResponseDTO();
        response.setCVV(card.getCvv());
        response.setVirtualCardNumber(card.getCardNumber());
        response.setExpiryDate(card.getExpirationDate());
        response.setCardStatus(card.getStatus());
        return response;
    }
}
