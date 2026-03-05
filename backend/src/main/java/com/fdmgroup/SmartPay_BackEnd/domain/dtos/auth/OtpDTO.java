package com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class OtpDTO {

  @NotBlank(message = "Email is required")
  @Email(message = "Enter a valid email address (example: name@domain.com).")
  @Schema(example = "test@gmail.com", description = "The user's registered email address")
  private String email;

  @NotBlank(message = "Code is required")
  @Pattern(regexp = "^\\d{7}$", message = "Code must be exactly 7 digits")
  @Schema(example = "1234567", description = "The 7-digit OTP")
  private String code;

  @NotNull(message = "OTP type is required")
  @Enumerated(EnumType.STRING)
  private EventType type;

  public String getEmail() {
    return this.email.toLowerCase();
  }

}