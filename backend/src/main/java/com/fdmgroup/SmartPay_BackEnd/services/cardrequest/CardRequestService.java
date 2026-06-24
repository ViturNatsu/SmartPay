package com.fdmgroup.SmartPay_BackEnd.services.cardrequest;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest.CardRequestResponseDTO;
import lombok.AllArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.List;


public interface CardRequestService {
    List<CardRequestResponseDTO> getAllRequests();

    List<CardRequestResponseDTO> getPendingRequests();

    CardRequestResponseDTO getRequestById(Long requestId);

    CardRequestResponseDTO approveRequest(Long requestId);

    CardRequestResponseDTO denyRequest(Long requestId, String denyReason);

}
