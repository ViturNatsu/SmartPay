package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RecurringPayeeRequestDTO {

    @JsonProperty("payeeName")
    @NotNull
    @NotBlank
    private String payeeName;

    @NotBlank
    @Pattern(
        regexp = "^\\d{8}$",
        message = "Account number must be exactly 8 digits."
    )
    private String recipientIdentifier;

    @JsonProperty("amount")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false,
            message = "Amount must be greater than $0.00")
    private Double amount;

    @JsonProperty("schedule")
    @NotNull
    private Schedule schedule;

    @JsonProperty("date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate date;

    @NotNull(message = "Recurring payment type is required")
    private RecurringPaymentType type;
    
    @JsonProperty("endDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate endDate;

}
