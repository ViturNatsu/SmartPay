package com.fdmgroup.SmartPay_BackEnd.controllers.account;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.account.AccountDTO;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
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

        @PostMapping("/forUser/{id}")
        @Operation(summary = "Creates a new account for user with specified id", description = "Create a new account for a specified user.")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "201", description = "Account created successfully"),
                @ApiResponse(responseCode = "404", description = "User with specified id not found"),
                @ApiResponse(responseCode = "500", description = "Internal server error, likely means account request body was invalid")
        })
        public ResponseEntity<Account> createAccountForUser(@Valid @RequestBody Account account, @PathVariable  long id) {
                Account createdAccount = accountService.createAccountForUser(account, id);
                URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                        .buildAndExpand(createdAccount.getId()).toUri();
                return ResponseEntity.created(location).body(createdAccount);
        }

        @PostMapping
        @Operation(summary = "Create a new account", description = "Create a new savings or checking account for a specified user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Account created successfully. Returns the created account object.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
                        @ApiResponse(responseCode = "404", description = "User not found with the specified userId.")
        })
        public ResponseEntity<Account> addAccount(@Valid @RequestBody Account account) throws UserNotFoundException {
                Account createdAccount = accountService.addAccount(account);
                URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                                .buildAndExpand(createdAccount.getId()).toUri();
                return ResponseEntity.created(location).body(createdAccount);
        }

        @GetMapping("/user/{userId}")
        @Operation(summary = "Retrieve user accounts", description = "Fetch accounts associated with a user. Can be filtered by type (SAVINGS or CHECKING).")
        @ApiResponses(value = {
                @ApiResponse(responseCode = "200", description = "List of accounts retrieved successfully.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
                @ApiResponse(responseCode = "400", description = "Invalid account type provided."),
                @ApiResponse(responseCode = "403", description = "Forbidden: user cannot access another user's accounts."),
                @ApiResponse(responseCode = "404", description = "User not found with the specified userId.")
        })
        public ResponseEntity<List<AccountDTO>> getAccounts(
                @PathVariable("userId") Long userId,
                @RequestParam(value = "type", required = false) AccountType type,
                Authentication authentication
        ) throws UserNotFoundException {

            Long authenticatedUserId = Long.valueOf(authentication.getName());

            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(accountService.getAccounts(userId, type));
        }

        @GetMapping("/all")
        @Operation(summary = "Retrieve all accounts", description = "Fetch all accounts in the system.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Accounts retrieved successfully.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),

        })
        public ResponseEntity<List<AccountDTO>> getAllAccounts() {
                return ResponseEntity.ok(accountService.getAllAccounts());
        }

        @GetMapping("/{accountId}")
        @Operation(summary = "Retrieve a specific account by ID", description = "Fetch a single account using its account ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Account retrieved successfully.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
                        @ApiResponse(responseCode = "404", description = "Account not found with the specified accountId.")
        })
        public ResponseEntity<AccountDTO> getAccountById(@PathVariable("accountId") Long accountId)
                        throws AccountNotFoundException {
                AccountDTO targetAccount = accountService.getAccountById(accountId);
                return ResponseEntity.ok(targetAccount);
        }

        @DeleteMapping("/{accountId}")
        @Operation(summary = "Delete an account", description = "Delete an account using its account ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Account deleted successfully."),
                        @ApiResponse(responseCode = "404", description = "Account not found with the specified accountId.")
        })
        public ResponseEntity<Void> deleteAccount(@PathVariable("accountId") Long accountId) {
                accountService.deleteAccount(accountId);
                return ResponseEntity.noContent().build();
        }

        @PutMapping("/{accountId}")
        @Operation(summary = "Update an existing account", description = "Update account details (name, balance) for the specified account.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Account updated successfully. Returns the updated account object.", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Account.class))),
                        @ApiResponse(responseCode = "404", description = "Account not found with the specified accountId.")
        })
        public ResponseEntity<Account> updateAccount(@PathVariable("accountId") Long accountId,
                        @Valid @RequestBody Account account) throws AccountNotFoundException {
                Account updatedAccount = accountService.updateUserAccount(accountId, account);
                return ResponseEntity.ok(updatedAccount);
        }


        @Operation(summary = "Returns a list of the user's inactive accounts (Active flag = false). Filtered" +
          "by an optional Institution number")
        @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "List of user's inactive accounts"),
          @ApiResponse(responseCode = "404", description = "User ID not found")
        })
        @GetMapping("/inactive/user/{userId}")
        public ResponseEntity<List<AccountDTO>> getInactiveAccountsForUser(
          @PathVariable Long userId,
          @RequestParam(required = false) String institution)
        {
                return ResponseEntity.ok(accountService.getInactiveAccounts(userId, institution));
        }
}
