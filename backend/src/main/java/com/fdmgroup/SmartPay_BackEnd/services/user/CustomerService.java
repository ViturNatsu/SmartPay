package com.fdmgroup.SmartPay_BackEnd.services.user;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.CustomerDTO;

public interface CustomerService {
    CustomerDTO  getCustomerInfo(Long userId);

    CustomerDTO updateCustomerInfo(Long userId, CustomerDTO customerInfo);

    Long parseUserId(String userId);


}
