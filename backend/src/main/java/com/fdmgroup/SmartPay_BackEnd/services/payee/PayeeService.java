package com.fdmgroup.SmartPay_BackEnd.services.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;

import java.util.List;

public interface PayeeService {

    List<PayeeDTO> getPayeesByOwnerId(Long ownerId);

    PayeeDTO addPayee(Long ownerId, String recipientEmail);
}
