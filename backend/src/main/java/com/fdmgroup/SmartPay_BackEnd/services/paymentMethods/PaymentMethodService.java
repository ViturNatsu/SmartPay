package com.fdmgroup.SmartPay_BackEnd.services.paymentMethods;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.paymentMethod.PaymentMethodDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PaymentMethodService {



    PaymentMethodDTO addPaymentMethod(PaymentMethodDTO pm) throws AccountNotFoundException;

    List<PaymentMethod> findByUserId(Long id);

    Page<PaymentMethodDTO> findByUserId(Long userId, int pageNumber);

    //for admin dashboard
    List<PaymentMethod> findAllPaymentMethods();

    PaymentMethod findPaymentMethodById(Long id);

    void deletePaymentMethod(Long id) throws AccountNotFoundException;

    //Update the payment method active status only
    PaymentMethodDTO updatePaymentMethodActiveStatus(Long id, Boolean activeStatus);
}
