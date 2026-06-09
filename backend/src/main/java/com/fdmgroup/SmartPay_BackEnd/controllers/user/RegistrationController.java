package com.fdmgroup.SmartPay_BackEnd.controllers.user;

import java.util.Map;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.user.SignUpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.user.DuplicateEmailException;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.user.RegistrationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth/register")
@AllArgsConstructor
public class RegistrationController {
    private final RegistrationService registrationService;
    private final OtpService otpService;

    // sequence for card generation
    private final WalletService walletService;
    private final CardService cardService;

    @PostMapping
    @Operation(summary = "Register and create new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered/created."),
            @ApiResponse(responseCode = "429", description = "Too many requests. Rate limit exceeded."),
            @ApiResponse(responseCode = "409", description = "User email already exists, cannot create an account with a duplicate email")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "User creation payload", required = true)
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody SignUpDTO userDto,
            HttpServletRequest httpRequest) {
        if (!userDto.getPassword().equals(userDto.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }
        User user = registrationService.register(userDto);

        otpService.requestOtp(user.getEmail(), EventType.REGISTER, httpRequest);


        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "otpSent", true));
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<?> handleDuplicateEmail() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "Please sign in, or reset your password if you already have an account."));
    }
}
