package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetWithOtpDto;
import com.fdmgroup.SmartPay_BackEnd.exception.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.InvalidTokenException;
import com.fdmgroup.SmartPay_BackEnd.exception.PasswordResetException;
import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;
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
    public ResponseEntity<String> validate7DigitCode(@RequestBody ConfirmCodeDTO payload) {
        try {
            accessCodeValidatorService.validate(payload);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        return ResponseEntity.ok("Code validated successfully");
    }

    /**
     * Reset password using OTP code
     */
    @PutMapping("/change-password")
    public ResponseEntity<String> resetPasswordWithOTP(
            @Valid @RequestBody PasswordResetWithOtpDto request,
            HttpServletRequest httpRequest) {

        try {
            passwordResetService.resetPasswordWithOTP(request, httpRequest);
            return ResponseEntity.ok("Password Reset Successful");
        } catch (InvalidTokenException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        } catch (PasswordResetException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        } catch (AccountLockedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("We can't process this request right now. Please try again later.");
        } catch (Exception e) {
            log.error("Error resetting password with OTP", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred. Please try again later.");
        }
    }
}
