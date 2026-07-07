package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;

@Repository
public interface RecurringPayeeRepository extends JpaRepository<RecurringPayee, Long>{

    Optional<RecurringPayee> findByPayeeIdAndOwnerIdAndActiveTrue(Long payeeId, Long ownerId);

    List<RecurringPayee> findByOwnerIdAndActiveTrue(Long ownerId);

    Optional<RecurringPayee> findByOwnerIdAndRecipientId(Long ownerId, Long recipientId);
}
