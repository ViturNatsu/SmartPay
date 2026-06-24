package com.fdmgroup.SmartPay_BackEnd.services.cardRequest;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;

import java.util.List;


public interface CardRequestService {
    List<CardRequestResponseDTO> getAllRequests();

    List<CardRequestResponseDTO> getPendingRequests();

    CardRequestResponseDTO getRequestById(Long requestId);

    CardRequestResponseDTO approveRequest(Long requestId);

    CardRequestResponseDTO denyRequest(Long requestId, String denyReason);

}
