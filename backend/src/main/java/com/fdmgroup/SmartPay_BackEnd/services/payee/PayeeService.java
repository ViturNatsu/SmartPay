package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;

public interface PayeeService {


   public PayeeResponseDTO addPayee(Long ownerId, String payeeName, String recipientIdentifier);

    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId);

    
}
