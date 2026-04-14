package com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    private Long payment_method_id;

    @Column(name = "bankId")
    private Long bankId;

    @Column(name = "bankDisplayName")
    private String bankDisplayName;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "accountIdentifierMasked")
    private String accountIdentifierMasked;
}
