package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;

public interface RecurringPayeeService {
    RecurringPayeeResponseDTO addRecurringPayee(Long ownerId, RecurringPayeeRequestDTO payeeRequestDTO);

    List<RecurringPayeeResponseDTO> getRecurringPayeesForUser(Long ownerId);

    void deleteRecurringPayee(Long ownerId, Long payeeId);
}
