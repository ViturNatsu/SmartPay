package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class CustomerDTO {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    // Contact information
    @NotBlank(message = "Address Line 1 is required")
    private String addressLine1;


    private String addressLine2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Province is required")
    private String province;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Postal code is required")
    private String postalCode;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    // Identification information
    @NotBlank(message = "Social Insurance Number is required")
    private String socialInsuranceNumber;

    @NotNull(message = "Government ID type is required")
    private String governmentIdType;

    @NotBlank(message = "Government ID number is required")
    private String governmentIdNumber;

    @NotBlank(message = "Occupation is required")
    private String occupation;

    @NotBlank(message = "Date of birth is required")
    private String dob;

}
