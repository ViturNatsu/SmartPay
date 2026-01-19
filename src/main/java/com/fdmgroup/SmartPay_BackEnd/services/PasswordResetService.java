package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;

public interface PasswordResetService {
    String startResetRequest(String email);
    void createPasswordResetCode(PasswordReset passwordReset);
    String generatePasswordResetCode();
}
