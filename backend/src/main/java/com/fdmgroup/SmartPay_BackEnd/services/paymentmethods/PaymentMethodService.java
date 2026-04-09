package com.fdmgroup.SmartPay_BackEnd.services.paymentmethods;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import org.springframework.stereotype.Service;

@Service
public interface PaymentMethodService {



    PaymentMethod addPaymentMethod(PaymentMethod pm);
}
