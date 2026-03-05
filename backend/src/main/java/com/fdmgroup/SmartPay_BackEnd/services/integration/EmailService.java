package com.fdmgroup.SmartPay_BackEnd.services.integration;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration.EmailDetails;

public interface EmailService {
    void sendSimpleMail(EmailDetails details);

}
