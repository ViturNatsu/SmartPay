package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Digits;
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

    private String recipientIdentifier;

    @JsonProperty("amount")
    @NotNull
    @DecimalMin(value = "0.00", inclusive = false,
            message = "Amount must be positive."
        )
    @Digits(
        integer = 5,
        fraction = 2,
        message = "Amount cannot have more than 2 decimal places."
        )
    private BigDecimal amount;

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
    private LocalDate endDate;

    private Long paymentMethodId;

    @JsonIgnore
    @AssertTrue(message = "Account number must be exactly 8 digits.")
    private boolean isRecipientIdentifierValidForType() {
        if (type != RecurringPaymentType.BILL) {
            return true;
        }
        return recipientIdentifier != null && recipientIdentifier.matches("^\\d{8}$");
    }
}
