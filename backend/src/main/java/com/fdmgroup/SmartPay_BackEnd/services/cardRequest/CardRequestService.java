package com.fdmgroup.SmartPay_BackEnd.services.cardRequest;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CreateCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.CardRequest;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.coyote.Request;

import java.util.List;


public interface CardRequestService {
    List<CardRequestResponseDTO> getAllRequests();

    List<CardRequestResponseDTO> getPendingRequests();

    CardRequestResponseDTO getRequestById(Long requestId);

    CardRequestResponseDTO approveRequest(Long requestId);

    CardRequestResponseDTO denyRequest(Long requestId, String denyReason);

    boolean CardHasPendingRequest(Card card);

    void requestNewCardOtp(User user, HttpServletRequest httpRequest);

    CardRequestResponseDTO createNewCardRequest(
            User user,
            CreateCardRequestDTO dto,
            HttpServletRequest httpRequest
    );
}
