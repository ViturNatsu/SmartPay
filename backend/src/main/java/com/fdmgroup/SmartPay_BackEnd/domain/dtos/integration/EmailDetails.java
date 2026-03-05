package com.fdmgroup.SmartPay_BackEnd.domain.dtos.integration;

import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Setter
public class EmailDetails {
    @Id
    private Long id;
    private String recipient;
    private String msgBody;
    private String subject;
}
