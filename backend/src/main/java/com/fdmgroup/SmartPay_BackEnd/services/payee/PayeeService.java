package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;

public interface PayeeService {

    PayeeResponseDTO addPayee(Long ownerId, String payeeName, String recipientIdentifier);

    List<PayeeResponseDTO> getPayeesForUser(Long ownerId);
}
