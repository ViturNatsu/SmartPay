package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.services.PasswordResetService;

@RestController
@RequestMapping("api/v1/password-reset")
public class PasswordResetController {
    
	private PasswordResetService service;

	public PasswordResetController(PasswordResetService service) {
		super();
		this.service = service;
	}
	
	@PostMapping
	public ResponseEntity<String> startResetRequest(@RequestBody String email) {
		return ResponseEntity.status(service.startResetRequest(email)).build();
	}
}
