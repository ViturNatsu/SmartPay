package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.EmailDetails;

public interface EmailService {
    void sendSimpleMail(EmailDetails details);

}
