package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpRequestDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;


import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/otp")
@Slf4j
@AllArgsConstructor
public class OtpController {
	PasswordResetService passwordResetService;
    OtpService otpService;
    UserService userService;
    JwtSessionService jwtSessionService;
    SessionService sessionService;

    @Operation(summary = "Request password reset", description = "Initiates the password reset flow. For security reasons, this returns 202 regardless of whether the email exists.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Reset request accepted (Email sent if account exists)"),
            @ApiResponse(responseCode = "400", description = "Invalid input (Empty email or wrong format)"),
            @ApiResponse(responseCode = "429", description = "Too many requests. Limit: 5 per 24 hours. Account locked for 24 hours.")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> requestOtp(@Valid @RequestBody OtpRequestDto dto) {
        String email = dto.getEmail();
        HttpStatus status;

        switch (dto.getType()) {
            case LOGIN, REGISTER, FORGOT_PASSWORD -> status = otpService.requestOtp(email, dto.getType());
            default -> {
                log.error("Unknown OTP type encountered");
                status = HttpStatus.BAD_REQUEST;
            }
        }

        return ResponseEntity.status(status).body(Map.of("otpSent", status.is2xxSuccessful()));
    }

    @Operation(summary = "Confirm 7-digit OTP", description = "Validates the OTP. Handles format validation (422), and expiration/security checks (401).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Code validated successfully", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "401", description = "Reset code is invalid or has expired", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Email address not found", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "422", description = "Code is too weak or validation failed", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "429", description = "Account temporarily locked due to multiple failed attempts", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "An error occurred. Please try again later", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/verify")
    public ResponseEntity<?> validate7DigitOTP(@Valid @RequestBody OtpDTO payload) {
        Otp otp = otpService.verifyOtp(payload);

        switch (payload.getType()) {
            case LOGIN -> {
                User user = userService.findByEmail(payload.getEmail().trim().toLowerCase());
                String accessToken = jwtSessionService.createAccessToken(user);
                String refreshToken = jwtSessionService.createRefreshToken(user);
                sessionService.generateNewSession(user, refreshToken);

                otp.markAsUsed();
                otpService.save(otp);
                return ResponseEntity.ok(new LoginResponseDTO(user.getId(), accessToken, refreshToken));
            }
            case REGISTER -> {
                User user = userService.findByEmail(payload.getEmail().trim().toLowerCase());
                user.setEmailVerified(true);
                user.setEmailVerifiedAt(LocalDateTime.now());
                userService.save(user);

                otp.markAsUsed();
                otpService.save(otp);
                return ResponseEntity.ok(Map.of("verified", true));
            }
            case FORGOT_PASSWORD -> {
                // Do not mark as used here. The password reset endpoint consumes the code.
                return ResponseEntity.ok(Map.of("verified", true));
            }
            default -> {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Unknown OTP type"));
            }
        }
}

    }
