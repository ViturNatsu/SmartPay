package com.fdmgroup.SmartPay_BackEnd.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.PasswordResetDTO;
import com.fdmgroup.SmartPay_BackEnd.services.impl.PasswordResetServiceImpl;

@RestController
@RequestMapping("api/v1/password-reset")
public class PasswordResetController {
    
	private PasswordResetServiceImpl service;

	public PasswordResetController(PasswordResetServiceImpl service) {
		super();
		this.service = service;
	}
	
	@PostMapping
	public ResponseEntity<String> startResetRequest(@RequestBody PasswordResetDTO dto) {
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
