package com.fdmgroup.SmartPay_BackEnd.services.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;

import lombok.AllArgsConstructor;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class CardServiceImpl implements CardService {
    private final CardRepository cardRepository;

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
