package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;

@Repository
public interface PayeeRepository extends JpaRepository<Payee, Long> {

    Optional<Payee> findByOwnerIdAndRecipientId(Long ownerId, Long recipientId);

    List<Payee> findByOwnerIdAndActiveTrue(Long ownerId);

    Optional<Payee> findByPayeeIdAndOwnerIdAndActiveTrue(Long payeeId, Long ownerId);

    Optional<Payee> findByOwnerIdAndRecipientIdAndActiveTrue(Long ownerId, Long recipientId);
}
