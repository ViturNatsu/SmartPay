package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.RegisterUserDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("api/v1/registration")
@AllArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<?> register(@Valid @RequestBody RegisterUserDTO userDto) {

        User user = registrationService.register(userDto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(user);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<?> handleDuplicateEmail() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Please sign in, or reset your password if you already have an account."));
    }
}

