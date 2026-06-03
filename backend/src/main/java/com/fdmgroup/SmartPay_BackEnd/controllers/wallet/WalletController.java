package com.fdmgroup.SmartPay_BackEnd.controllers.wallet;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;

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
    @Operation(summary = "Get wallet by user ID",
               description = "Retrieve the wallet associated with a specific user ID. "
                           + "If the wallet does not exist, a new wallet will be created for the user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Wallet retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User with specified ID not found")
    })
    public ResponseEntity<Wallet> getWalletByUserId(@PathVariable long userId) {
        Wallet wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(wallet);
    }

    /**
     * Updates the wallet-level daily spending limit for the authenticated user.
     *
     * The daily spending limit applies across the entire wallet and all linked
     * funding sources. Any outgoing wallet transaction contributes toward this
     * daily limit regardless of which funding source is used.
     *
     * Ownership is verified before updating the limit to ensure users can only
     * modify limits on their own wallet.
     *
     * @param userId the owner of the wallet
     * @param request DTO containing the new daily spending limit
     * @param authentication the authenticated user principal
     * @return the updated wallet containing the new daily spending limit
     */
    @PostMapping("/{userId}/limits/daily")
    @Operation(summary = "Update wallet daily spending limit",
            description = "Updates the wallet-level daily spending limit.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Daily limit updated successfully"),
        @ApiResponse(responseCode = "403", description = "User does not own this wallet"),
        @ApiResponse(responseCode = "400", description = "Invalid limit amount")
    })
    public ResponseEntity<Wallet> updateDailySpendingLimit(
            @PathVariable long userId,
            @RequestBody WalletDailyLimitRequestDTO request,
            Authentication authentication) {

        User principalUser = (User) authentication.getPrincipal();

        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Wallet updatedWallet =
                walletService.updateDailySpendingLimit(userId, request);

        return ResponseEntity.ok(updatedWallet);
    }

    /**
     * Withdraws funds from the authenticated user's wallet to a linked bank account.
     *
     * The caller must be the owner of the wallet (userId path variable must match
     * the authenticated principal). Ownership is verified here before delegating to
     * the service layer, following the same pattern as PaymentMethodController.
     *
     * Returns 403 if the authenticated user tries to withdraw from another user's wallet.
     * Returns 400 for invalid amounts (≤ 0).
     * Returns 422 for amounts exceeding the wallet balance.
     */
    @PostMapping("/{userId}/withdraw")
    @Operation(summary = "Withdraw funds from wallet",
               description = "Deducts the specified amount from the user's wallet balance "
                           + "and transfers it to the selected linked bank account.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Withdrawal successful"),
        @ApiResponse(responseCode = "400", description = "Invalid withdrawal amount"),
        @ApiResponse(responseCode = "403", description = "User does not own this wallet"),
        @ApiResponse(responseCode = "422", description = "Insufficient wallet balance")
    })
    public ResponseEntity<Wallet> withdrawFunds(
            @PathVariable long userId,
            @RequestBody WithdrawRequestDTO request,
            Authentication authentication) {

        // Verify the authenticated user is the owner of the wallet (DIP / security boundary)
        User principalUser = (User) authentication.getPrincipal();
        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Wallet updated = walletService.withdrawFunds(userId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Updates the wallet-level per-transaction spending limit for the authenticated user.
     *
     * The per-transaction limit applies to any single outgoing wallet transaction,
     * regardless of which linked funding source is used.
     *
     * Ownership is verified before updating the limit to ensure users can only
     * modify limits on their own wallet.
     *
     * @param userId the owner of the wallet
     * @param request DTO containing the new per-transaction limit
     * @param authentication the authenticated user principal
     * @return the updated wallet containing the new per-transaction limit
     */
    @PostMapping("/{userId}/limits/per-transaction")
    @Operation(summary = "Update wallet per-transaction spending limit",
            description = "Updates the wallet-level per-transaction spending limit.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Per-transaction limit updated successfully"),
        @ApiResponse(responseCode = "403", description = "User does not own this wallet"),
        @ApiResponse(responseCode = "400", description = "Invalid limit amount")
    })
    public ResponseEntity<Wallet> updatePerTransactionLimit(
            @PathVariable long userId,
            @RequestBody WalletPerTransactionLimitRequestDTO request,
            Authentication authentication) {

        User principalUser = (User) authentication.getPrincipal();

        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Wallet updatedWallet =
                walletService.updatePerTransactionLimit(userId, request);

        return ResponseEntity.ok(updatedWallet);
    }
}
