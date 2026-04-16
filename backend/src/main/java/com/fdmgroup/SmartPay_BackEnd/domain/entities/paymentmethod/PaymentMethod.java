package com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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

    @ManyToOne
    @JoinColumn(name = "fk_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;
    // TODO
}
