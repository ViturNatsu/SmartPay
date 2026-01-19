package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;

@RestController
@RequestMapping("api/v1/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService){
        this.emailService = emailService;
    }

    @PostMapping("/sendemail")
    public String sendMail(@RequestBody EmailDetails details)
    {
        return emailService.sendSimpleMail(details);
    }

}
