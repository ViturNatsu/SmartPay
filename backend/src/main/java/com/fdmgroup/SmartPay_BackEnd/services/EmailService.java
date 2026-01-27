package com.fdmgroup.SmartPay_BackEnd.services;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;

public interface EmailService {
    String sendSimpleMail(EmailDetails details);

}
