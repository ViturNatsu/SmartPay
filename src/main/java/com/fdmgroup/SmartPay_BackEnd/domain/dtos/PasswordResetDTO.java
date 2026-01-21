package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PasswordResetDTO {
	@NotBlank
	private String email;
	
	public PasswordResetDTO(String email) {
		super();
		this.email = email;
	}

}