package com.fdmgroup.SmartPay_BackEnd.repositories.card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;

import java.time.LocalDateTime;
import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    boolean existsByCardNumber(String candidate);

    Card findByWalletWalletId(Long id);

    List<Card> findAllByExpirationDateBefore(LocalDateTime dateTime);




    @Query("""
    SELECT u.id
    FROM Card c
    JOIN c.wallet w
    JOIN w.user u
    WHERE c.cardId = :cardId
    """)
    Optional<Long> findUserIdByCardId(@Param("cardId") Long cardId);

    @Query("""
    SELECT c
    FROM Card c
    JOIN c.wallet w
    JOIN w.user u
    WHERE u.id = :userId
    """)
    Optional<Card> findCardByUserId(@Param("userId") Long userId);

    Optional<Card> findByCardId(String cardId);
}
