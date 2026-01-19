package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import org.springframework.http.HttpStatus;

public interface PasswordResetService {
    HttpStatus startResetRequest(String email);
    boolean validateEmailFormat(String email);
    void createPasswordResetCode(String email);
    String generatePasswordResetCode();
}
