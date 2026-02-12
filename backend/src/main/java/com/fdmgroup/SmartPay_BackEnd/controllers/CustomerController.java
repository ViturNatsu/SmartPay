package com.fdmgroup.SmartPay_BackEnd.controllers;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.CustomerDTO;
import com.fdmgroup.SmartPay_BackEnd.services.CustomerService;
import com.fdmgroup.SmartPay_BackEnd.repositories.UserRepository; // make sure you have this
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/auth")
@AllArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final UserRepository userRepository;

    @GetMapping("/customer")
    public ResponseEntity<CustomerDTO> getCustomerInfo() {

        // Get the current authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user found");
        }


        // Get userId of currently logged-in user
        String userId = authentication.getName();
        long id;
        try {
            id = Long.parseLong(userId);
        } catch (NumberFormatException e) {
            id = 0; // or handle error
        }
        // Fetch the User entity from the database
        CustomerDTO customerInfo = customerService.getCustomerInfo(id);
        if (customerInfo == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer Info not found");
        }

        return ResponseEntity.ok(customerInfo);
    }
}
