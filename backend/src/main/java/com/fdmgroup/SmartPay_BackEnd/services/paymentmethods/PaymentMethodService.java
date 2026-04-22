package com.fdmgroup.SmartPay_BackEnd.services.paymentmethods;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PaymentMethodService {



    PaymentMethod addPaymentMethod(PaymentMethod pm);

    List<PaymentMethod> findByUserId(Long id);

    Page<PaymentMethod> findByUserId(Long userId, int pageNumber);
}
