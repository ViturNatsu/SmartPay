package com.fdmgroup.SmartPay_BackEnd.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.RegistrationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth/register")
@AllArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;
    private final OtpService otpService;

    @PostMapping
    @Operation(summary = "Register and create new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered/created."),
            @ApiResponse(responseCode = "429", description = "Too many requests. Rate limit exceeded."),
            @ApiResponse(responseCode = "409", description = "User email already exists, cannot create an account with a duplicate email")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User creation payload", required = true)
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody SignUpDTO userDto) {
        if (!userDto.getPassword().equals(userDto.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }
        User user = registrationService.register(userDto);
        otpService.requestOtp(user.getEmail(), OtpType.REGISTER);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "otpSent", true
                ));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<?> handleDuplicateEmail() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Please sign in, or reset your password if you already have an account."));
    }
}

