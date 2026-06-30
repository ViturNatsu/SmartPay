package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recurring_payee_id")
    private long recurringpayeeId;

    @Column(name = "amount", nullable=false)
    @Positive
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule", nullable=false)
    private Schedule schedule;

    @Column(name= "dateCreated", nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
