package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPaymentExecutionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecurringPaymentsExecutionRepository extends JpaRepository<RecurringPaymentExecutionRecord, Long> {
}