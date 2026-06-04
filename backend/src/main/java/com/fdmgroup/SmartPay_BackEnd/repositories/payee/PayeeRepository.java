package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayeeRepository extends JpaRepository<Payee, Long> {

    List<Payee> findByOwnerId(Long ownerId);

    Optional<Payee> findByOwnerIdAndRecipientId(Long ownerId, Long recipientId);
}
