package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.AccessCodePayload;
import com.fdmgroup.SmartPay_BackEnd.services.AccessCodeValidatorService;
import com.fdmgroup.SmartPay_BackEnd.services.impl.PasswordResetServiceImpl;

@RestController
@RequestMapping("api/v1/password-reset")
public class PasswordResetController {

	private PasswordResetServiceImpl service;
	private AccessCodeValidatorService accessCodeValidatorService;

	public PasswordResetController(PasswordResetServiceImpl service,
			AccessCodeValidatorService accessCodeValidatorService) {
		super();
		this.service = service;
		this.accessCodeValidatorService = accessCodeValidatorService;
	}

	@PostMapping
	public ResponseEntity<String> startResetRequest(@RequestBody PasswordResetDTO dto) {
		String email = dto.getEmail();
		HttpStatus status = service.startResetRequest(email);
		return ResponseEntity.status(status).build();
	}

	@PostMapping
	public ResponseEntity<String> validate7DigitCode(@RequestBody AccessCodePayload payload) {
		try {
			accessCodeValidatorService.validate(payload);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
		return ResponseEntity.ok("Code validated successfully");
	}
}
