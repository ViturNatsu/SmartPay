package com.fdmgroup.SmartPay_BackEnd.repositories.payee;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Payee;

@Repository
public interface PayeeRepository extends JpaRepository<Payee, Long> {

    boolean existsByOwnerIdAndRecipientId(Long ownerId, Long recipientId);

    List<Payee> findByOwnerId(Long ownerId);
}
