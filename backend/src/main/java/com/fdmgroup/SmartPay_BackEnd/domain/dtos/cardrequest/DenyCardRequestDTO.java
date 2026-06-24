package com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest;


import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DenyCardRequestDTO {

    @Size(max = 500)
    private String denyReason;
}