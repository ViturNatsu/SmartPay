package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;
import org.springframework.web.bind.annotation.*;

/**
 * US-F02-02-01 (Sign In)
 * Controller responsible for authentication-related endpoints
 *
 * Flow:
 * 1) Validate credentials using UserService.validateCredentials(...)
 * 2) Generate JWT token using JwtService.generateToken(email)
 * 3) Return token to the client
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }


    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) {

        // Validate credentials (throws if invalid).
        userService.validateCredentials(request.getEmail(), request.getPassword());

        // Normalize email before using it as the JWT subject.
        // Keep this consistent with how UserRepository.findByEmail(...) is called.
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Generate JWT using the user's email as the subject.
        String token = jwtService.generateToken(normalizedEmail);

        // Return the token to the client.
        return new LoginResponseDTO(token);
    }
}
