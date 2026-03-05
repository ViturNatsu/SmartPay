package com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * US-F02-02-01 (Sign In)
 * DTO for incoming login requests from the client.
 *
 */
public class LoginRequestDTO {

    @NotBlank(message = "Email is Required. Can't be left blank.")
    @Email(message = "Enter a valid email address (example: name@domain.com).")
    private String email;

    @NotBlank(message = "Password is Required. Can't be left blank.")
    private String password;


    public String getEmail() {
        return email;
    }


    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }


    public void setPassword(String password) {
        this.password = password;
    }
}
