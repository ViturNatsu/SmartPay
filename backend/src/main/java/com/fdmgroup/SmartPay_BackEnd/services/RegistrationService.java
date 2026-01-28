package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;



public interface RegistrationService {
    User register(SignUpDTO userDto);

    String consistentEmail(String email);

}