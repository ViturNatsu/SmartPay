package com.fdmgroup.SmartPay_BackEnd.controllers.wallet;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransferDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

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
    public ResponseEntity<WalletResponseDTO> getWalletByUserId(@PathVariable long userId) {
        WalletResponseDTO wallet = walletService.getWalletByUserId(userId);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/load")
    @Operation(summary = "Load funds into wallet",
               description = "Transfer funds from a linked payment method into the user's wallet.")
    public ResponseEntity<WalletResponseDTO> loadFunds(
            @Valid @RequestBody LoadWalletRequestDTO request,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(walletService.loadFunds(user.getId(), request));
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
    public ResponseEntity<WalletResponseDTO> updateDailySpendingLimit(
            @PathVariable long userId,
            @RequestBody WalletDailyLimitRequestDTO request,
            Authentication authentication) {

        User principalUser = (User) authentication.getPrincipal();

        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        WalletResponseDTO updatedWallet =
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
    public ResponseEntity<WalletResponseDTO> withdrawFunds(
            @PathVariable long userId,
            @RequestBody WithdrawRequestDTO request,
            Authentication authentication) {
        User principalUser = (User) authentication.getPrincipal();
        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(walletService.withdrawFunds(userId, request));
    }

    @GetMapping("/{userId}/transactions")
    public ResponseEntity<List<WalletTransactionDTO>> getTransactions(
            @PathVariable long userId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {

        User principalUser = (User) authentication.getPrincipal();

        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<WalletTransactionDTO> transactions =
                walletService.getTransactions(userId, limit);

        return ResponseEntity.ok(transactions);
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
    public ResponseEntity<WalletResponseDTO> updatePerTransactionLimit(
            @PathVariable long userId,
            @RequestBody WalletPerTransactionLimitRequestDTO request,
            Authentication authentication) {

        User principalUser = (User) authentication.getPrincipal();

        if (!principalUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        WalletResponseDTO updatedWallet =
                walletService.updatePerTransactionLimit(userId, request);

        return ResponseEntity.ok(updatedWallet);
    }
}
