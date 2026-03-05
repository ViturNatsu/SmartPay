package com.fdmgroup.SmartPay_BackEnd.controllers.account;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDto;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.AccountType;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("api/v1/accounts")
public class AccountController {
    private final AccountService accountService;
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    @Operation(summary = "Create a new account",
            description = "Create a new savings or checking account for a specified user.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Account created successfully. Returns the created account object.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found with the specified userId.")
    })
    public ResponseEntity<Account> addAccount(@Valid @RequestBody Account account)throws UserNotFoundException {
        Account createdAccount = accountService.addAccount(account);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(createdAccount.getId()).toUri();
        return ResponseEntity.created(location).body(createdAccount);
    }

    @GetMapping("/user/{userId}")
     @Operation(summary = "Retrieve user accounts",
            description = "Fetch accounts associated with a user. Can be filtered by type (SAVINGS or CHECKING).")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "List of accounts retrieved successfully.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid account type provided."),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found with the specified userId.")
    })
    public ResponseEntity<List<AccountDto>> getAccounts(@PathVariable Long userId, @RequestParam(required = false) AccountType type)throws UserNotFoundException{
        return ResponseEntity.ok(accountService.getAccounts(userId, type));

    }

    @GetMapping("/{accountId}")
      @Operation(summary = "Retrieve a specific account by ID",
            description = "Fetch a single account using its account ID.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Account retrieved successfully.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "Account not found with the specified accountId.")
    })
    public ResponseEntity<Account> getAccountById(@PathVariable Long accountId) throws AccountNotFoundException {
        Account targetAccount = accountService.getAccountById(accountId);
        return ResponseEntity.ok(targetAccount);
    }

    @DeleteMapping("/{accountId}")
     @Operation(summary = "Delete an account",
            description = "Delete an account using its account ID.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Account deleted successfully."),
            @ApiResponse(
                    responseCode = "404",
                    description = "Account not found with the specified accountId.")
    })
    public ResponseEntity<Void> deleteAccount(@PathVariable Long accountId){
        accountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{accountId}")
      @Operation(summary = "Update an existing account",
            description = "Update account details (name, balance) for the specified account.")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Account updated successfully. Returns the updated account object.",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
            @ApiResponse(
                    responseCode = "404",
                    description = "Account not found with the specified accountId.")
    })
    public  ResponseEntity<Account> updateAccount(@PathVariable Long accountId, @Valid @RequestBody Account account) throws AccountNotFoundException {
        Account updatedAccount = accountService.updateUserAccount(accountId,account);
        return ResponseEntity.ok(updatedAccount);
    }

}
