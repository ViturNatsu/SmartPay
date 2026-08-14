package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;

@Repository
public interface RecurringBillingChargeRepository extends JpaRepository<RecurringBillingCharge, Long> {

    Optional<RecurringBillingCharge> findByIdempotencyKey(String idempotencyKey);

    Optional<RecurringBillingCharge> findByChargeId(String chargeId);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
