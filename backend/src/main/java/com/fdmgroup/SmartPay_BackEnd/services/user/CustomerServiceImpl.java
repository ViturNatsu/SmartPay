package com.fdmgroup.SmartPay_BackEnd.services.user;

import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.GovernmentIdType;
import com.fdmgroup.SmartPay_BackEnd.exception.user.CustomerInfoNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.user.CustomerRepository;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final MaskingUtil maskingUtil;

    @Override
    public CustomerDTO getCustomerInfo(Long userId) {
        Customer customerInfo = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomerInfoNotFoundException("Customer Info not found"));
        return mapToDto(customerInfo);
    }

    @Override
    public CustomerDTO updateCustomerInfo(Long userId, CustomerDTO customerInfo) {

        Customer existingCustomer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomerInfoNotFoundException("Customer Info not found"));


        existingCustomer.setFirstName(customerInfo.getFirstName());
        existingCustomer.setLastName(customerInfo.getLastName());

        existingCustomer.setAddressLine1(customerInfo.getAddressLine1());
        existingCustomer.setAddressLine2(customerInfo.getAddressLine2());
        existingCustomer.setCity(customerInfo.getCity());
        existingCustomer.setProvince(customerInfo.getProvince());
        existingCustomer.setCountry(customerInfo.getCountry());
        existingCustomer.setPostalCode(customerInfo.getPostalCode());
        existingCustomer.setPhoneNumber(customerInfo.getPhoneNumber());

        existingCustomer.setSocialInsuranceNumber(customerInfo.getSocialInsuranceNumber());
        existingCustomer.setGovernmentIdType(GovernmentIdType.valueOf(customerInfo.getGovernmentIdType()));
        existingCustomer.setGovernmentIdNumber(customerInfo.getGovernmentIdNumber());

        existingCustomer.setOccupation(customerInfo.getOccupation());
        existingCustomer.setDob(customerInfo.getDob());

        Customer updatedCustomer = customerRepository.save(existingCustomer);

        return mapToDto(updatedCustomer);
    }


    @Override
    public Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("User ID must be a valid numeric value", ex);
        }
    }

    private CustomerDTO mapToDto(Customer customer) {
        return CustomerDTO.builder()
                .firstName(customer.getFirstName())
                .lastName(customer.getLastName())
                .dob(customer.getDob())
                .addressLine1(customer.getAddressLine1())
                .addressLine2(customer.getAddressLine2())
                .city(customer.getCity())
                .province(customer.getProvince())
                .postalCode(customer.getPostalCode())
                .country(customer.getCountry())
                .phoneNumber(customer.getPhoneNumber())
                .socialInsuranceNumber(
                        maskingUtil.maskSin(customer.getSocialInsuranceNumber()).getFirst())
                .governmentIdType(customer.getGovernmentIdType().name())
                .governmentIdNumber(
                        maskingUtil.maskGovernmentId( customer.getGovernmentIdNumber()).getFirst())
                .occupation(customer.getOccupation())
                .build();
    }
}
