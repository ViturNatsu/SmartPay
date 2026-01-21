package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.exception.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.ConfirmCodeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetDTO;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidator;

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

    @PostMapping
    public ResponseEntity<String> startResetRequest(@RequestBody PasswordResetDTO dto) {
        String email = dto.getEmail();
        HttpStatus status = passwordResetService.startResetRequest(email);
        return ResponseEntity.status(status).build();
    }

    @PostMapping("/code")
    public String createPasswordResetCode() {
        String email = "bob@gmail.com";
        String code = passwordResetService.createPasswordResetCode(email);
        System.out.println(code);
        return code;
    }

    @PostMapping("/confirm-code")
    public ResponseEntity<String> validate7DigitCode(@Valid @RequestBody ConfirmCodeDTO payload) {
        try {
            accessCodeValidatorService.validate(payload);
        } catch (IllegalArgumentException | AccessCodeMismatchException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (InvalidTokenException e) {
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
        return ResponseEntity.ok("Code validated successfully"); 
    }

    /**
     * Reset password using OTP code
     */
    @Operation(
            summary = "Reset password using OTP",
            description = "Submits a new password along with a one-time access code to reset the user's password."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password reset successful",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "400", description = "Passwords do not match",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "401", description = "Reset code is invalid or has expired",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "404", description = "Email address not found",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "422", description = "Password is too weak or validation failed",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "429", description = "Account temporarily locked due to multiple failed attempts",
                    content = @Content(schema = @Schema(implementation = String.class))),
            @ApiResponse(responseCode = "500", description = "An error occurred. Please try again later",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })
    @PutMapping("/change-password")
    public ResponseEntity<String> resetPasswordWithOTP(
            @Valid @RequestBody PasswordResetWithOtpDto request,
            HttpServletRequest httpRequest) {

        try {
            passwordResetService.resetPasswordWithOTP(request, httpRequest);
            return ResponseEntity.ok("Password Reset Successful");

        } catch (PasswordResetDoNotMatchException e) {
            // 400 – passwords mismatch
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());

        } catch (InvalidTokenException | AccessCodeMismatchException e) {
            // 401 – invalid or expired reset code
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());

        } catch (IllegalArgumentException e) {
            // 404 – resource not found (e.g., email not found)
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());

        } catch (AccountLockedException e) {
            // 429 – too many failed attempts
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("We can't process this request right now. Please try again later.");

        } catch (Exception e) {
            // 500 – unexpected error
            log.error("Error resetting password with OTP", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred. Please try again later.");
        }
    }
}
