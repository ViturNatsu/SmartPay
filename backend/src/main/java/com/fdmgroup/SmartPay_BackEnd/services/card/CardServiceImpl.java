package com.fdmgroup.SmartPay_BackEnd.services.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.integration.EmailService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class CardServiceImpl implements CardService {
    private final CardRepository cardRepository;
    private final EmailService emailService;

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

        return response;
    }
}
