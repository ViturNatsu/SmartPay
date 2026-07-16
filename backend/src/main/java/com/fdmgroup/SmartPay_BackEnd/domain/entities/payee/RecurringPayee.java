package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name= "recurring_payee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPayee extends Payee{

    @Column(name = "amount", nullable=false)
    @Positive
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule", nullable=false)
    private Schedule schedule;

    @Column(name = "date", nullable=false)
    private LocalDate date;

    @Column(name = "dateCreated", nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
