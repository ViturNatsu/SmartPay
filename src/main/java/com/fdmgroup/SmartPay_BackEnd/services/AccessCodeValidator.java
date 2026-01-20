package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;

public interface AccessCodeValidator {

    public void validate(ConfirmCodeDTO payload);
}
