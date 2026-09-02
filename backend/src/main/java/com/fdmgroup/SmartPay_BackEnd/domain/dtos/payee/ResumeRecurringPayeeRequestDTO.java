package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResumeRecurringPayeeRequestDTO {
    @JsonProperty("nextPaymentDate")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate nextPaymentDate;   // optional — required only when > 6 months paused, enforced in service
}