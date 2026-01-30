package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.EmailDetails;
import com.fdmgroup.SmartPay_BackEnd.services.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("api/v1/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @Operation(summary = "Send email request", description = "Sends email to recipient with msgBody text")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email sent"),
            @ApiResponse(responseCode = "401", description = "Email is unauthenticated"),
    })
    @PostMapping("/send-email")
    public void sendMail(@RequestBody EmailDetails details) {
         emailService.sendSimpleMail(details);
    }

}
