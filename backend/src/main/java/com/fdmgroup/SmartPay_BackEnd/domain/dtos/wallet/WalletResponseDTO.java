package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WalletResponseDTO {

    @NotBlank
    private Long wallet_id;

    @NotBlank
    private Double balance;

    private Double dailySpendingLimit;

    private Double perTransactionLimit;
    private LocalDate dailySpentDate;

    private Double dailySpentAmount;
}
