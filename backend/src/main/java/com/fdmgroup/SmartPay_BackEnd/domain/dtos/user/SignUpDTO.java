package com.fdmgroup.SmartPay_BackEnd.domain.dtos.user;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignUpDTO {

    @NotNull
    private String firstName;

    @NotNull
    private String lastName;

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

    @NotNull(message = "Customer details are required.")
    @Valid
    private CustomerDTO customer;

    public void setEmail(String email) {
        if (email == null) {
            this.email = null;
        } else {
            this.email = email.trim().toLowerCase();
        }
    }
}
