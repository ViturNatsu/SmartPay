package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import jakarta.servlet.http.HttpServletRequest;

public interface AccessCodeValidator {

    public void validate(ConfirmCodeDTO payload);
    public PasswordReset validate(ConfirmCodeDTO payload, HttpServletRequest httpRequest);
}
