package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Request body for initiating a password reset")
public class PasswordResetDTO {
	
	@NotBlank
	@Email
	@Schema(
        description = "User's registered email address", 
        example = "user@example.com", 
        requiredMode = Schema.RequiredMode.REQUIRED
    )
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