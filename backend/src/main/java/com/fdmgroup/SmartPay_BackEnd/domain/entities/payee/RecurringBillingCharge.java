package com.fdmgroup.SmartPay_BackEnd.domain.entities.payee;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "recurring_billing_charges",
        uniqueConstraints = @UniqueConstraint(name = "uk_recurring_billing_idempotency", columnNames = "idempotency_key")
)
@Getter
@Setter
@NoArgsConstructor
public class RecurringBillingCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** UUID-based transaction identifier for this charge attempt. */
    @Column(name = "charge_id", nullable = false, unique = true, updatable = false)
    private String chargeId;

    /** One key per recurring payee per billing cycle — prevents duplicate charges. */
    @Column(name = "idempotency_key", nullable = false, unique = true, updatable = false)
    private String idempotencyKey;

    @ManyToOne(optional = false)
    @JoinColumn(name = "recurring_payee_id", nullable = false, updatable = false)
    private RecurringPayee recurringPayee;

    @Column(name = "billing_cycle_date", nullable = false, updatable = false)
    private LocalDate billingCycleDate;

    @Column(name = "amount", nullable = false, updatable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RecurringBillingStatus status;

    /** Reference passed to the payment provider for crash recovery confirmation. */
    @Column(name = "provider_reference_id")
    private String providerReferenceId;

    @Column(name = "wallet_transaction_id")
    private String walletTransactionId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "failure_reason")
    private RecurringBillingFailureReason failureReason = RecurringBillingFailureReason.NONE;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
