package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class PasswordResetDTO {
	@NotBlank
	@Email
	private String email;
	
	public PasswordResetDTO(String email) {
		super();
		this.email = email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getEmail() {
		return email;
	}
}