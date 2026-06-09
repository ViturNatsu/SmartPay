package com.fdmgroup.SmartPay_BackEnd.services.card;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

import jakarta.transaction.Transactional;

public interface CardService {

    @Transactional
    CardResponseDTO createCard(Wallet wallet);

    CardResponseDTO getCardByWalletId(Long id);
}
