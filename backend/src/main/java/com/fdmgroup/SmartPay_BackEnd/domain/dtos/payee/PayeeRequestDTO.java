package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PayeeRequestDTO {

    @JsonProperty("recipientId")
    @NotNull
    private Long recipientId;

  

}
