package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import jakarta.servlet.http.HttpServletRequest;

public interface AccessCodeValidator {
    Otp validate(OtpDTO payload, HttpServletRequest httpRequest);
}
