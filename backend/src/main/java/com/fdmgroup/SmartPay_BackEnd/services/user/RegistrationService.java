package com.fdmgroup.SmartPay_BackEnd.services.user;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;



public interface RegistrationService {
    User register(SignUpDTO userDto);

    String consistentEmail(String email);

}