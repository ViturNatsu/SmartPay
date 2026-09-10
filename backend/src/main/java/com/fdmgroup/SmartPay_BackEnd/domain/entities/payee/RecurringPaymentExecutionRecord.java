package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name= "recurring_payment_execution")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPaymentExecutionRecord {

    @Id
    @GeneratedValue
    private Long id;
    @Column(name = "invocation_date", nullable = false, updatable = false)
    private LocalDate invocationDate;
    @Column(name = "payments_active_in_system", nullable = false, updatable = false)
    private long paymentsActive;
    @Column(name = "payments_found", nullable = false, updatable = false)
    private Long paymentsFoundAtTrigger;
    @Column(name = "payments_processed", nullable = false, updatable = false)
    private Long processedPaymentsCount;
    @Column(name="payments_already_charged", nullable = false, updatable = false)
    private long alreadyChargedCount;
    @Column(name="payment_failed", nullable = false, updatable = false)
    private long failedCount;
    @Column(name="recovered_after_crash", nullable = false, updatable = false)
    private long recoveredAfterCrash;

}
