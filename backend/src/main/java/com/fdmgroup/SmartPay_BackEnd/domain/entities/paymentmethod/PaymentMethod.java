package com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
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
    private Long paymentMethodId;

    @Column(name = "bankId")
    private Long bankId;

    @Column(name = "bankDisplayName")
    private String bankDisplayName;

    @Column(name = "active")
    private Boolean active;

    @ManyToOne
    @JsonBackReference
    private Account account;

    @ManyToOne
    @JoinColumn(name = "fk_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;
    // TODO
}
