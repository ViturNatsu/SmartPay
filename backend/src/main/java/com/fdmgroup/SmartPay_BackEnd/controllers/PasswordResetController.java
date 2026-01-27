package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("api/v1/password-reset")
@Slf4j
public class PasswordResetController {
    PasswordResetService passwordResetService;
    AccessCodeValidator accessCodeValidatorService;

    public PasswordResetController(PasswordResetService passwordResetService,
            AccessCodeValidator accessCodeValidatorService) {
        this.passwordResetService = passwordResetService;
        this.accessCodeValidatorService = accessCodeValidatorService;
    }

    @Operation(summary = "Confirm 7-digit access code", description = "Validates the OTP. Handles format validation (422), and expiration/security checks (401).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Code validated successfully", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "401", description = "Reset code is invalid or has expired", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Email address not found", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "422", description = "Code is too weak or validation failed", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "429", description = "Account temporarily locked due to multiple failed attempts", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "An error occurred. Please try again later", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PostMapping("/confirm-code")
    public ResponseEntity<String> validate7DigitCode(
            @Valid @RequestBody OtpDTO payload,
            HttpServletRequest httpRequest) {
        accessCodeValidatorService.validate(payload, httpRequest);
        return ResponseEntity.ok("Code validated successfully");
    }

    /**
     * Reset password using OTP code
     */
    @Operation(summary = "Reset password using OTP", description = "Submits a new password along with a one-time access code to reset the user's password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successful", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Passwords do not match", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "401", description = "Reset code is invalid or has expired", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Email address not found", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "422", description = "Password is too weak or validation failed", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "429", description = "Account temporarily locked due to multiple failed attempts", content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "An error occurred. Please try again later", content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PutMapping("/change-password")
    public ResponseEntity<String> resetPasswordWithOTP(
            @Valid @RequestBody PasswordResetWithOtpDto request,
            HttpServletRequest httpRequest) {
        passwordResetService.resetPasswordWithOTP(request, httpRequest);
        return ResponseEntity.ok("Password Reset Successful");
    }
}
