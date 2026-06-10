package com.fdmgroup.SmartPay_BackEnd.services.system;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.repositories.card.CardRepository;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CardRenewalSchedulerImpl {

    private final CardRepository cardRepository;
    private final CardService cardService;

    // Renew all expired cards daily at 1AM
    @Scheduled(cron = "0 0 1 * * *")
    // For testing purposes only
    // @Scheduled(fixedRate = 10000) 
    public void renewExpiredCards() {
        List<Card> expiredCards = cardRepository.findAllByExpirationDateBefore(LocalDateTime.now());

        expiredCards.forEach(card -> {
            cardService.renewIfExpired(card.getWallet().getWalletId());
        });
    }
}
