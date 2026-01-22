package com.fdmgroup.SmartPay_BackEnd.domain.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class EmailDetails {
    @Id
    private Long id;
    private String recipient;
    private String msgBody;
    private String subject;

    public EmailDetails(String email, String msgBody, String resetYourPassword) {
    }
}
