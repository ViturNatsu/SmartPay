package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;

public interface RecurringPayeeService {
    RecurringPayeeResponseDTO addRecurringPayee(Long ownerId, RecurringPayeeRequestDTO payeeRequestDTO);

    List<RecurringPayeeResponseDTO> getRecurringPayeesForUser(Long ownerId);

    RecurringPayeeResponseDTO updateRecurringPayee(Long ownerId, Long recurringPayeeId, RecurringPayeeRequestDTO payeeRequestDTO);

    void deleteRecurringPayee(Long ownerId, Long payeeId);

    void cancelRecurringPayee(Long ownerId, Long payeeId);

    void reactivateRecurringPayee(Long ownerId, Long payeeId);

    void pauseRecurringPayee(Long ownerId, Long payeeId);

    void resumeRecurringPayee(Long ownerId, Long payeeId);


}
