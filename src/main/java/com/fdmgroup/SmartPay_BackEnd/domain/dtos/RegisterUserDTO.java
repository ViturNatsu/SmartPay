package com.fdmgroup.SmartPay_BackEnd.domain.dtos;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserDTO {

    @NotBlank(message = "Email is required")
    private String email;

    //@NotBlank(message = "Password is required")
    private String password;

}
