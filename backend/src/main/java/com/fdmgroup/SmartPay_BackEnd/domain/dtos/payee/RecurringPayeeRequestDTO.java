package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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

    @JsonProperty("recipientIdentifier")
    @NotNull
    @NotBlank
    private String recipientIdentifier;

    @JsonProperty("amount")
    @NotNull
    @Positive
    private Double amount;

    @JsonProperty("schedule")
    @NotNull
    private Schedule schedule;

    @JsonProperty("date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @NotNull
    private LocalDate date;

}
