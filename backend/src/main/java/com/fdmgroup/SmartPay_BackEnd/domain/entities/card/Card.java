package com.fdmgroup.SmartPay_BackEnd.domain.entities.card;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cards")
@Getter
@Setter
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @NotBlank
    @Column(columnDefinition = "VARCHAR(16)", nullable = false)
    private String cardNumber;

    @NotBlank
    @Column(columnDefinition = "VARCHAR(3)", nullable = false)
    private String cvv;

    @Column(columnDefinition = "DATE", nullable = false)
    private LocalDateTime expirationDate;

    @NotNull
    private CardStatus status;

    @NotNull
    @OneToOne
    @JoinColumn(nullable = false, name = "wallet_id") // name of the column that refers to the wallet
    private Wallet wallet;
}
