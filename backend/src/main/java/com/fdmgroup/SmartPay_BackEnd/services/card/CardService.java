package com.fdmgroup.SmartPay_BackEnd.services.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import jakarta.transaction.Transactional;

public interface CardService {

    @Transactional
    CardResponseDTO createCard(Wallet wallet);

    boolean renewIfExpired(Long userId);

    CardResponseDTO getCardByWalletId(Long id);

    CardResponseDTO getCardByUserId(Long userIdDDS);

    void changeCardStatusByUserId(Long userId, EventType eventType);

    void lockSanityCheck(Long userId, EventType eventType);
}
