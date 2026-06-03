package com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Entity
@Table(name = "wallets")
@Getter
@Setter
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wallet_id")
    private Long wallet_id;

    @Column(name = "balance")
    private Double balance;

    @Column(name = "daily_spending_limit")
    private Double dailySpendingLimit ;

    @Column(name = "per_transaction_limit")
    private Double perTransactionLimit;

    @Column(name = "daily_spent_amount")
    private Double dailySpentAmount = 0.0;

    @Column(name = "daily_spent_date")
    private LocalDate dailySpentDate;

    @OneToOne
    @JoinColumn(name = "fk_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private User user;
}