package com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class PayeeResponseDTO {

    private Long payeeId;
    private String payeeName;
    private Long recipientId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}
