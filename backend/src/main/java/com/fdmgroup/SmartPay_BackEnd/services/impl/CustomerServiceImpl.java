package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;

import com.fdmgroup.SmartPay_BackEnd.repositories.CustomerRepository;
import com.fdmgroup.SmartPay_BackEnd.services.CustomerService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {
   // private final CustomerService userService;
    private final CustomerRepository customerRepository;

    @Override
    public CustomerDTO getCustomerInfo(Long userId) {
        Customer customerInfo = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer Info not found"));
        return mapToDto(customerInfo);
    }

    private CustomerDTO mapToDto(Customer customer) {
        return CustomerDTO.builder()
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .addressLine1(customer.getAddressLine1())
                .addressLine2(customer.getAddressLine2())
                .city(customer.getCity())
                .province(customer.getProvince())
                .postalCode(customer.getPostalCode())
                .phoneNumber(customer.getPhoneNumber())
                .socialInsuranceNumber(
                        MaskingUtil.maskSin(customer.getSocialInsuranceNumber()))
                .governmentIdType(customer.getGovernmentIdType().name())
                .governmentIdNumber(MaskingUtil.maskGovernmentId(
                                customer.getGovernmentIdNumber()))
                .occupation(customer.getOccupation())
                .build();
    }
}
