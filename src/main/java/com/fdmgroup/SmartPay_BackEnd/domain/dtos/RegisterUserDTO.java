package com.fdmgroup.SmartPay_BackEnd.domain.dtos;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDTO {

    @NotNull
    @Email(message = "Please enter a valid email address.")
    private String email;
    @NotNull
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must be at least 8 characters long and include at least one uppercase letter one lowercase letter, one number, and one special character."
                            )

    private String password;
    @NotNull
    private String confirmPassword;

}
