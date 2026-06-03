package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PayeeRequestDTO {

    @JsonProperty("payeeName")
    @NotNull
    @NotBlank
    private String payeeName;

    @JsonProperty("recipientIdentifier")
    @NotNull
    @NotBlank
    private String recipientIdentifier;

  

}
