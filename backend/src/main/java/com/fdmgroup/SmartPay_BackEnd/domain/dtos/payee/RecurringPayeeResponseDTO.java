package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

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
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private Schedule schedule;
    private Double amount;
}