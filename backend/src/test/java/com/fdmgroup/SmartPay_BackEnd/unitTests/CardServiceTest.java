package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SpringBootTest
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;
    @Mock
    private GenerateStringsHelper generateStringsHelper;
    @InjectMocks
    private CardServiceImpl cardService;

    private String baseCardNumber = "6400123412341234";
    private String baseCVV = "123";
    private LocalDateTime baseExpiry = LocalDateTime.now().plusYears(2);

    @Test
    void shouldReturnCard_whenWalletIdExists() {
        Long walletId = 1L;

        Card card = new Card();
        card.setCardNumber("6400123456789012");
        card.setCvv("123");
        card.setExpirationDate(LocalDateTime.of(2028, 12, 31, 0, 0));

        when(cardRepository.findByWalletWalletId(walletId)).thenReturn(card);



        CardResponseDTO result = cardService.getCardByWalletId(walletId);

        assertNotNull(result);
        assertEquals("6400123456789012", result.getVirtualCardNumber());
        assertEquals("123", result.getCVV());
        assertEquals(LocalDateTime.of(2028, 12, 31, 0, 0), result.getExpiryDate());

        verify(cardRepository, times(1)).findByWalletWalletId(walletId);
    }

    @Test
    void shouldThrowWalletNotFoundException_whenWalletIdDoesNotExist() {
        Long walletId = 999L;

        when(cardRepository.findByWalletWalletId(walletId)).thenReturn(null);

        assertThrows(WalletNotFoundException.class, () -> {
            cardService.getCardByWalletId(walletId);
        });

        verify(cardRepository, times(1)).findByWalletWalletId(walletId);
    }

    @Test
    void shouldCreateCardSuccessfully_whenWalletIsProvided() {
        Wallet wallet = new Wallet();


        when(generateStringsHelper.generateCardNumber()).thenReturn(baseCardNumber);
        when(generateStringsHelper.generateCVV()).thenReturn(baseCVV);
        when(generateStringsHelper.generateExpiryDate()).thenReturn(baseExpiry);

        CardResponseDTO result = cardService.createCard(wallet);

        ArgumentCaptor<Card> cardCaptor = ArgumentCaptor.forClass(Card.class);
        verify(cardRepository, times(1)).save(cardCaptor.capture());

        Card savedCard = cardCaptor.getValue();

        assertNotNull(savedCard);
        assertNotNull(savedCard.getCardNumber());
        assertEquals(savedCard.getCardNumber(), baseCardNumber);
        assertNotNull(savedCard.getCvv());
        assertEquals(savedCard.getCvv(), baseCVV);
        assertNotNull(savedCard.getExpirationDate());
        assertEquals(savedCard.getExpirationDate(), baseExpiry);

        assertTrue(savedCard.getCardNumber().startsWith("6400"));
        assertEquals(16, savedCard.getCardNumber().length());
        assertEquals(3, savedCard.getCvv().length());

        assertEquals(wallet, savedCard.getWallet());
        assertEquals(CardStatus.ACTIVE, savedCard.getStatus());

        assertNotNull(result);
        assertEquals(savedCard.getCardNumber(), result.getVirtualCardNumber());
        assertEquals(savedCard.getCvv(), result.getCVV());
        assertEquals(savedCard.getExpirationDate(), result.getExpiryDate());


        verify(cardRepository, times(1)).save(any(Card.class));
    }

}
