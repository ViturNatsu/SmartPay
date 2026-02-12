package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "accounts")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public abstract class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long id;

    @Column(name = "account_name")
    private String accountName;

    @Column(name = "balance")
    private double balance;

    @ManyToOne
	@JoinColumn(name = "fk_user_id")
	@JsonBackReference
	private User user;

    public abstract AccountType getType();
}
