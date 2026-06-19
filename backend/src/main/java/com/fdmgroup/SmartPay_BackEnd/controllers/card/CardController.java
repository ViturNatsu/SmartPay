package com.fdmgroup.SmartPay_BackEnd.controllers.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth.OtpRequestDto;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.auth.Role;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardLockActionsRequiresUserRoleException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardLockRequestInvalidType;
import com.fdmgroup.SmartPay_BackEnd.services.auth.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

@RestController
@AllArgsConstructor
@RequestMapping("api/v1/cards")
@Slf4j
public class CardController {

    private final CardService cardService;
    private final OtpService otpService;

    @GetMapping("/{walletId}")
    @Operation(summary = "Get card by wallet ID",
            description = "Retrieve the card associated with a specific wallet ID. "
                    + "A card must exist and must be associated with an existing wallet.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Wallet with specified ID not found")
    })
    public ResponseEntity<CardResponseDTO> getCardByWalletId(@PathVariable long walletId) {
        CardResponseDTO card = cardService.getCardByWalletId(walletId);
        return ResponseEntity.ok(card);
    }

    @GetMapping("/user/forUser")
    @Operation(
            summary = "Get card for the authenticated user",
            description = "Retrieves the virtual card associated with the currently authenticated user. "
                    + "Only users with the USER role may access this endpoint."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "User is not authenticated"),
            @ApiResponse(responseCode = "403", description = "Authenticated user does not have the USER role"),
            @ApiResponse(responseCode = "404", description = "No card exists for the authenticated user")
    })
    public ResponseEntity<CardResponseDTO> getCardByAuthenticatedUser(Authentication authentication){

        User user = (User) authentication.getPrincipal();
        assert user != null;

        CardResponseDTO card = cardService.getCardByUserId(user.getId());
        return ResponseEntity.ok(card);
    }

    @PostMapping("/user/lock-requests")
    @Operation(
            summary = "Request OTP for card lock or unlock",
            description = "Generates and sends a one-time password (OTP) required to "
                    + "lock or unlock the authenticated user's card. "
                    + "The request type must be either CARD_LOCK or CARD_UNLOCK. "
                    + "The current card status must allow the requested operation."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "OTP request accepted and OTP generated"),
            @ApiResponse(responseCode = "400", description = "Invalid request type supplied"),
            @ApiResponse(responseCode = "401", description = "User is not authenticated"),
            @ApiResponse(responseCode = "403", description = "Authenticated user does not have the USER role"),
            @ApiResponse(responseCode = "404", description = "No card exists for the authenticated user"),
            @ApiResponse(responseCode = "409", description = "Card status does not allow the requested operation")
    })
    public ResponseEntity<Void> requestLock(
            @Valid @RequestBody OtpRequestDto otpRequestDto,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        requireValidLockType(otpRequestDto.getType());

        User user = (User) authentication.getPrincipal();
        assert user != null;
        Long userId = user.getId();

        cardService.lockSanityCheck(userId, otpRequestDto.getType());

        otpService.requestOtp(otpRequestDto.getEmail(), otpRequestDto.getType(), httpRequest);

        return ResponseEntity.accepted().build();
    }

    private void requireValidLockType(EventType type) {
        if (type != EventType.CARD_LOCK && type != EventType.CARD_UNLOCK) {
            log.error("Invalid OTP type encountered: {}", type);
            throw new CardLockRequestInvalidType();
        }
    }
}