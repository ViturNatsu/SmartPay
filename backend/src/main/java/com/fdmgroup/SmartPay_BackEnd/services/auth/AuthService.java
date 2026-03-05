package com.fdmgroup.SmartPay_BackEnd.services.auth;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.LoginRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO signIn(LoginRequestDTO loginDto);
}
