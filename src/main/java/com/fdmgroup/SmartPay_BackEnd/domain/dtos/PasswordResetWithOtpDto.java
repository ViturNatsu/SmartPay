package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetWithOtpDto {
    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address (example: name@domain.com).")
    @Schema(description = "User email address", example = "user@example.com")
    private String email;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).*$",
            message = "Password must contain at least 1 special character"
    )
    @Schema(description = "New password (min 8 chars, at least 1 special character)", example = "Password@123")
    private String newPassword;

    @NotBlank(message = "Password confirmation is required")
    @Schema(description = "Confirm the new password", example = "Password@123")
    private String confirmPassword;

    @NotBlank(message = "Code is required")
    @Pattern(regexp = "^\\d{7}$", message = "Code must be exactly 7 digits")
    @Schema(description = "7-digit access code sent via email or SMS", example = "1234567")
    private String code;

    public boolean passwordsMatch() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
}
