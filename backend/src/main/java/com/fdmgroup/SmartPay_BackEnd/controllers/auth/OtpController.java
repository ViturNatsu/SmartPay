package com.fdmgroup.SmartPay_BackEnd.controllers.auth;

import java.time.LocalDateTime;
import java.util.Map;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.Utility.TransactionExecutor;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.LoginResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpRequestDto;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import com.fdmgroup.SmartPay_BackEnd.services.user.PasswordResetService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    TransactionExecutor transactionExecutor;
    WalletService walletService;
    CardService cardService;
    NotificationService notificationService;


    @Operation(summary = "Request password reset", description = "Initiates the password reset flow. For security reasons, this returns 202 regardless of whether the email exists.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "Reset request accepted (Email sent if account exists)"),
            @ApiResponse(responseCode = "400", description = "Invalid input (Empty email or wrong format)"),
            @ApiResponse(responseCode = "429", description = "Too many requests. Limit: 5 per 24 hours. Account locked for 24 hours.")
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> requestOtp(@Valid @RequestBody OtpRequestDto dto,
            HttpServletRequest httpRequest) {
        HttpStatus status;

        switch (dto.getType()) {
            case LOGIN, REGISTER, FORGOT_PASSWORD, REVEAL_CARD ->
                status = otpService.requestOtp(dto.getEmail(), dto.getType(), httpRequest);
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
    public ResponseEntity<?> validate7DigitOTP(@Valid @RequestBody OtpDTO payload, HttpServletRequest httpRequest) {
        Otp otp = otpService.verifyOtp(payload, httpRequest);

        switch (payload.getType()) {
            case LOGIN -> {
                User user = userService.findByEmail(payload.getEmail().trim().toLowerCase());

                sessionService.deleteAllUserSessions(user);
                String accessToken = jwtSessionService.createAccessToken(user);
                String refreshToken = jwtSessionService.createRefreshToken(user);

                sessionService.generateNewSession(user, refreshToken);

                // Wallet logic for non admins
                if(user.getRole().equals(Role.USER)){
                    WalletResponseDTO wallet = walletService.getWalletByUserId(user.getId());
                    cardService.renewIfExpired(wallet.getWallet_id());
                }

                otp.markAsUsed();
                transactionExecutor.execute(() -> {
                    // Mark the OTP as used
                    otpService.save(otp);
                    // Check if the card linked to the wallet is expired, and renew if necessary
                });

                return ResponseEntity.ok(new LoginResponseDTO(user.getId(), accessToken, refreshToken));
            }
            case REGISTER -> {
                User user = userService.findByEmail(payload.getEmail().trim().toLowerCase());
                user.setEmailVerified(true);
                user.setEmailVerifiedAt(LocalDateTime.now());

                transactionExecutor.execute(() -> {
                    //Update the user into a verified state
                    userService.save(user);
                    //Mark the OTP as used
                    otp.markAsUsed();
                    //Update the OTP in the DB
                    otpService.save(otp);

                    if(user.getRole().equals(Role.USER)){
                        //Create Wallet associated to the account
                        Wallet wallet = walletService.createWallet(user.getId());
                        //Create Virtual Card associated to the wallet
                        cardService.createCard(wallet);
                    }

                });

                return ResponseEntity.ok(Map.of("verified", true));
            }
            case FORGOT_PASSWORD -> {
                // Do not mark as used here. The password reset endpoint consumes the code.
                return ResponseEntity.ok(Map.of("verified", true));
            }
            case REVEAL_CARD -> {
                // Mark as used immediately — the frontend unlocks the card UI on success.
                otp.markAsUsed();
                otpService.save(otp);
                return ResponseEntity.ok(Map.of("verified", true));
            }
            case CARD_LOCK, CARD_UNLOCK -> {
                User user = userService.findByEmail(payload.getEmail().trim().toLowerCase());

                transactionExecutor.execute(() -> {
                    cardService.changeCardStatusByUserId(user.getId(), otp.getOtpType());
                });
                return ResponseEntity.ok(Map.of("message", otp.getOtpType().toString() + "operation OK"));
            }
            default -> {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Unknown OTP type"));
            }
        }
    }
}
