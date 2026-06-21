package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;

public interface PayeeService {

    PayeeResponseDTO addPayee(Long ownerId, PayeeRequestDTO payeeRequestDTO);

    List<PayeeResponseDTO> getPayeesForUser(Long ownerId);

    void deletePayee(Long ownerId, Long payeeId);
}
