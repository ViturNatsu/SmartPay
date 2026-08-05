package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoadWalletRequestDTO {

    @NotNull(message = "Payment method is required")
    private Long paymentMethodId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", inclusive = true, message = "Amount must be at least $1.00")
    @DecimalMax(value = "10000.0", message = "Amount must not exceed $10,000.00")
    private Double amount;
}
