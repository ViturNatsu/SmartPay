package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetDTO;
import com.fdmgroup.SmartPay_BackEnd.services.impl.PasswordResetServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/password-reset")
public class PasswordResetController {
    
	private PasswordResetServiceImpl service;

	public PasswordResetController(PasswordResetServiceImpl service) {
		super();
		this.service = service;
	}
	
	@Operation(
		summary = "Request password reset",
		description = "Initiates the password reset flow. For security reasons, this returns 202 regardless of whether the email exists."
	)
	@ApiResponses(value = {
			@ApiResponse(
					responseCode = "202",
					description = "Reset request accepted (Email sent if account exists)"
			),
			@ApiResponse(
					responseCode = "400", 
					description = "Invalid input (Empty email or wrong format)"
			),
	        @ApiResponse(
	        		responseCode = "429", 
	        		description = "Too many requests. Limit: 5 per 24 hours. Account locked for 24 hours."
	        )
	})
	@PostMapping
	public ResponseEntity<Void> startResetRequest(@Valid @RequestBody PasswordResetDTO dto) {
		String 		email 	= dto.getEmail();
		HttpStatus 	status 	= service.startResetRequest(email);
		return ResponseEntity.status(status).build();
	}

    @PostMapping("/code")
    public String createPasswordResetCode() {
        String email = "bob@gmail.com";
        String code = service.createPasswordResetCode(email);
        System.out.println(code);
        return code;
    }
}
