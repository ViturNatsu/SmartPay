package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@Setter
@Entity
public class EmailDetails {
    @Id
    private Long id;
    private String recipient;
    private String msgBody;
    private String subject;
}
