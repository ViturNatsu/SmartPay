package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;

public interface PayeeService {

   public PayeeResponseDTO addPayee(Long ownerId, PayeeRequestDTO payeeRequestDTO);

    public List<PayeeResponseDTO> getPayeesForUser(Long ownerId);

    public void deletePayee(Long ownerId, Long payeeId);

}
