package com.fdmgroup.SmartPay_BackEnd.controllers.wallet;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransferDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("api/v1/wallets")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get wallet by user ID", description = "Retrieve the wallet associated with a specific user ID." +
        "If the wallet does not exist, a new wallet will be created for the user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Wallet retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User with specified ID not found")
    })
    public ResponseEntity<Wallet> getWalletByUserId(@PathVariable long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/{userId}/transfer")
    @Operation(summary = "Transfer funds from wallet to another user's wallet")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Transfer completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid transfer amount or memo"),
        @ApiResponse(responseCode = "403", description = "Forbidden: cannot transfer from another user's wallet"),
        @ApiResponse(responseCode = "422", description = "Insufficient wallet balance")
    })
    public ResponseEntity<Void> transfer(
            @PathVariable Long userId,
            @Valid @RequestBody WalletTransferDTO dto,
            Authentication authentication) {

        User principal = (User) authentication.getPrincipal();
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        walletService.transfer(userId, dto.recipientUserId(), dto.amount(), dto.memo());
        return ResponseEntity.noContent().build();
    }
}
