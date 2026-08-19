package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecurringPaymentType type;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(
        name = "amount",
        nullable = false,
        precision = 7,
        scale = 2
    )
    @Positive
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule", nullable=false)
    private Schedule schedule;

    @Column(name = "date", nullable=false)
    private LocalDate date;

    @Column(name="end_date", nullable=true)
    private LocalDate endDate;

    @Column(name = "last_processed_date")
    private LocalDate lastProcessedDate;

    @Column(name = "dateCreated", nullable=false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RecurringPaymentStatus status = RecurringPaymentStatus.ACTIVE;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

//    @Column(name = "status", insertable = false)
//    @Enumerated(EnumType.STRING)
//    private RecurringPaymentStatus status;


}
