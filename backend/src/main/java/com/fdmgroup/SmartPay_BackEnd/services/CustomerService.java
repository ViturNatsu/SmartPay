package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

import java.util.Optional;

public interface CustomerService {
    Long  createCustomer(Customer customer);

//    Optional<Customer> getByUser(User user);
//
//    Customer updatePersonalInformation(
//            User user,
//            Customer updatedInformation
//    );


}
