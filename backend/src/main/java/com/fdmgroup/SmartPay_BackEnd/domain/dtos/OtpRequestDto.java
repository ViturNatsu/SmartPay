package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Schema(description = "Request body for initiating a password reset")
@Getter
@AllArgsConstructor
public class OtpRequestDto {

	@Email
	@NotBlank(message = "Email is required")
	@Schema(description = "User's registered email address", example = "user@example.com")
	private String email;

	@NotNull(message = "OTP type is required")
	private EventType type;

	public String getEmail() {
		return this.email.toLowerCase();
	}

}