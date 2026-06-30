package com.fdmgroup.SmartPay_BackEnd.repositories.cardRequest;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface CardRequestRepository extends JpaRepository<CardRequest, Long> {
    List<CardRequest> findByRequestStatus(RequestStatus requestStatus);

    long countByUserAndRequestCreatedAtAfter(User user, LocalDateTime requestCreatedAt);

    boolean existsByCardAndRequestStatus(Card card, RequestStatus requestStatus);
}
