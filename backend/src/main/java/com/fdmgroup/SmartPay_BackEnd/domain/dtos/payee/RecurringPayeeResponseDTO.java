package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import java.time.LocalDate;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RecurringPayeeResponseDTO {

    private Long payeeId;
    private String payeeName;
    private Long recipientId;
    private String recipientIdentifier;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Schedule schedule;
    private Double amount;
    private LocalDate date;
    private RecurringPaymentType type;
    private LocalDate endDate;
}