package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.validation.constraints.Email;
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

    private String firstName;
    private String lastName;
    //contact information
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String province;
    private String country;
    private String postalCode;
    private String phoneNumber;

    //identification informatoin
    private String socialInsuranceNumber;
    private String governmentIdType;
    private String governmentIdNumber;

    private String occupation;
    private String dob;

}
