package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO signIn(LoginRequestDTO loginDto);
}
