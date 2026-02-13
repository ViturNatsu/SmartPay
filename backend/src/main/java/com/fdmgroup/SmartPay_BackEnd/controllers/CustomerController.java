package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.services.CustomerService;
import com.fdmgroup.SmartPay_BackEnd.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer")
@AllArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final JwtService jwtService;

    @GetMapping
    @Operation(summary = "Get Customer Personal Information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Receive the customer data successfully."),
            @ApiResponse(responseCode = "404", description = "Customer personal information not found in database."),
            @ApiResponse(responseCode = "401", description = "Missing or invalid Token"),
            @ApiResponse(responseCode = "400", description = "Invalid userId in Token Subject")
    })
    public ResponseEntity<CustomerDTO> getCustomerInfo(Authentication authentication) {

        // Get userId of currently logged-in user
        Long userId = customerService.parseUserId(authentication.getName());

        // Fetch the User entity from the database
        CustomerDTO customerInfo = customerService.getCustomerInfo(userId);

        return ResponseEntity.ok(customerInfo);
    }

    @PutMapping
    @Operation(summary = "Update Customer Personal Information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Customer data updated successfully."),
            @ApiResponse(responseCode = "404", description = "Customer personal information not found in database."),
            @ApiResponse(responseCode = "401", description = "Missing or invalid Token"),
            @ApiResponse(responseCode = "400", description = "Invalid userId in Token Subject")
    })
    public ResponseEntity<Map<String, String>> updateCustomerInfo(Authentication authentication, @Valid @RequestBody CustomerDTO customerDTO) {

        // Get userId of currently logged-in user
        Long userId = customerService.parseUserId(authentication.getName());

        // Update the User entity in the database
        customerService.updateCustomerInfo(userId, customerDTO);

        return ResponseEntity.ok(
                Map.of("message", "Customer Data Updated Successfully.")
        );
    }

}