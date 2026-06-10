package com.fdmgroup.SmartPay_BackEnd.unitTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.GenerateStringsHelper;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardServiceImpl;
import com.fdmgroup.SmartPay_BackEnd.services.integration.EmailService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
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
    @Mock
    private EmailService emailService;

    private String baseCardNumber = "6400123412341234";
    private String baseCVV = "123";
    private LocalDateTime baseExpiry = LocalDateTime.now().plusYears(2);

    private Card card;
    private Wallet wallet;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email("test@example.com")
                .password("plaintext")
                .build();

        wallet = new Wallet();
        wallet.setWalletId(1L);
        wallet.setUser(user);

        card = new Card();
        card.setCardNumber("6400123456789012");
        card.setExpirationDate(LocalDateTime.now().minusDays(1)); // already expired
        card.setCvv("123");
        card.setWallet(wallet);
    }

    @Test
    void shouldReturnCard_whenWalletIdExists() {
        Long walletId = 1L;

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

    @Test
    @DisplayName("Should renew card when expired")
    void renewIfExpired_whenCardIsExpired_shouldRenewAndReturnTrue() {
        when(cardRepository.findByWalletWalletId(1L)).thenReturn(card);
        when(generateStringsHelper.generateExpiryDate()).thenReturn(LocalDateTime.now().plusYears(2));
        when(generateStringsHelper.generateCVV()).thenReturn("456"); // different from current "123"

        boolean result = cardService.renewIfExpired(1L);

        assertTrue(result);
        verify(cardRepository).save(card);
        verify(emailService).sendSimpleMail(any(EmailDetails.class));
    }

    @Test
    @DisplayName("Should not renew card when not expired")
    void renewIfExpired_whenCardIsNotExpired_shouldReturnFalse() {
        card.setExpirationDate(LocalDateTime.now().plusYears(1)); // not expired
        when(cardRepository.findByWalletWalletId(1L)).thenReturn(card);

        boolean result = cardService.renewIfExpired(1L);

        assertFalse(result);
        verify(cardRepository, never()).save(any());
        verify(emailService, never()).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should throw WalletNotFoundException when wallet not found")
    void renewIfExpired_whenCardNotFound_shouldThrowWalletNotFoundException() {
        when(cardRepository.findByWalletWalletId(99L)).thenReturn(null);

        assertThrows(WalletNotFoundException.class,
            () -> cardService.renewIfExpired(99L));

        verify(cardRepository, never()).save(any());
        verify(emailService, never()).sendSimpleMail(any());
    }

    @Test
    @DisplayName("Should update expiry date to 2 years from now")
    void renewIfExpired_whenRenewed_shouldSetExpiryDateTwoYearsFromNow() {
        LocalDateTime fixedExpiry = LocalDateTime.of(2028, 6, 9, 0, 0, 0);

        when(cardRepository.findByWalletWalletId(1L)).thenReturn(card);
        when(generateStringsHelper.generateExpiryDate()).thenReturn(fixedExpiry); // same reference
        when(generateStringsHelper.generateCVV()).thenReturn("456");

        cardService.renewIfExpired(1L);

        assertEquals(fixedExpiry, card.getExpirationDate());
    }

    @Test
    @DisplayName("Should generate a different CVV from the current one")
    void renewIfExpired_whenRenewed_shouldSetDifferentCVV() {
        when(cardRepository.findByWalletWalletId(1L)).thenReturn(card);
        when(generateStringsHelper.generateExpiryDate()).thenReturn(LocalDateTime.now().plusYears(2));
        // First call returns same CVV, second call returns different one
        when(generateStringsHelper.generateCVV()).thenReturn("123", "456");

        cardService.renewIfExpired(1L);

        assertNotEquals("123", card.getCvv());
        assertEquals("456", card.getCvv());
    }

    @Test
    @DisplayName("Should send renewal email with correct recipient")
    void renewIfExpired_whenRenewed_shouldSendEmailToCorrectRecipient() {
        when(cardRepository.findByWalletWalletId(1L)).thenReturn(card);
        when(generateStringsHelper.generateExpiryDate()).thenReturn(LocalDateTime.now().plusYears(2));
        when(generateStringsHelper.generateCVV()).thenReturn("456");

        cardService.renewIfExpired(1L);

        ArgumentCaptor<EmailDetails> captor = ArgumentCaptor.forClass(EmailDetails.class);
        verify(emailService).sendSimpleMail(captor.capture());
        assertEquals("test@example.com", captor.getValue().getRecipient());
        assertEquals("Your Card Has Been Renewed", captor.getValue().getSubject());
    }
}
