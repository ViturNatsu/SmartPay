package com.fdmgroup.SmartPay_BackEnd.repositories.card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    boolean existsByCardNumber(String candidate);

    Card findByWalletWalletId(Long id);

    List<Card> findAllByExpirationDateBefore(LocalDateTime dateTime);
}
