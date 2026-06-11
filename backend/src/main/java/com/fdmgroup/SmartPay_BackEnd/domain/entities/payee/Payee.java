package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payee_id")
    private long payeeId;

    @ManyToOne
    @JoinColumn(name= "owner_user_id", nullable = false)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    @Column(name = "payee_name", nullable = false)
    private String payeeName;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private boolean active = true;

}
