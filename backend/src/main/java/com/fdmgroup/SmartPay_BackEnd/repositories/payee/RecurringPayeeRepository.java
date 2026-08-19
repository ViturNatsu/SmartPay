package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;

@Repository
public interface RecurringPayeeRepository extends JpaRepository<RecurringPayee, Long>{

    Optional<RecurringPayee> findByPayeeIdAndOwnerIdAndActiveTrue(Long payeeId, Long ownerId);

    List<RecurringPayee> findByOwnerIdAndActiveTrue(Long ownerId);

    Optional<RecurringPayee> findByOwnerIdAndRecipientId(Long ownerId, Long recipientId);
    
    boolean existsByOwnerIdAndAccountNumberAndPayeeNameAndAmountAndScheduleAndDateAndActiveTrue(
            Long ownerId,
            String accountNumber,
            String payeeName,
            BigDecimal amount,
            Schedule schedule,
            LocalDate date
    );

    Optional<RecurringPayee> findByPayeeIdAndOwnerId(Long payeeId, Long ownerId);

    @Query("""
            select recurringPayee.payeeId
            from RecurringPayee recurringPayee
            where recurringPayee.active = true
              and recurringPayee.status = :status
              and recurringPayee.date <= :invocationDate
              and (recurringPayee.endDate is null or recurringPayee.endDate >= :invocationDate)
            """)
    List<Long> findDuePaymentIds(
            @Param("invocationDate") LocalDate invocationDate,
            @Param("status") RecurringPaymentStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select recurringPayee from RecurringPayee recurringPayee where recurringPayee.payeeId = :payeeId")
    Optional<RecurringPayee> findByPayeeIdForProcessing(@Param("payeeId") Long payeeId);

    Optional<RecurringPayee> findByPayeeId(Long payeeId);

    List<RecurringPayee> findByActiveTrueAndStatus(RecurringPaymentStatus status);
}
