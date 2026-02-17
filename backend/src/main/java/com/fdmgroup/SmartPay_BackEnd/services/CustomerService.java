package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;

public interface CustomerService {
    CustomerDTO  getCustomerInfo(Long userId);

    CustomerDTO updateCustomerInfo(Long userId, CustomerDTO customerInfo);

    Long parseUserId(String userId);


}
