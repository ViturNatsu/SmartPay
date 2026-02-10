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
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "account_id")
    private Long id;

    @Column(name = "balance")
    private double balance;

    @ManyToOne
	@JoinColumn(name = "fk_user_id")
	@JsonBackReference
	private User user;
}
