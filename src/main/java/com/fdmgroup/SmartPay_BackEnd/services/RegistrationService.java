package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.RegisterUserDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;



public interface RegistrationService {
    User register(RegisterUserDTO userDto);

    String consistentEmail(String email);

}