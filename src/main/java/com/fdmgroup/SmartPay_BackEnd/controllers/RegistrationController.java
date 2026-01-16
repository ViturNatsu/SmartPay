package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.RegisterUserDTO;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("api/v1/registration")
@AllArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    public String register(@RequestBody RegisterUserDTO userDto) {
        return registrationService.register(userDto);
    }
}

