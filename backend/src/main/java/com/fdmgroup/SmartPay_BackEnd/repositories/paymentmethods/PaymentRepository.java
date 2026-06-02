package com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentMethod, Long> {

    List<PaymentMethod> findByUserId(Long userId);

    Page<PaymentMethod> findByUserId(Long userId, Pageable pageable);

    List<PaymentMethod> findAllByUser_Id(Long userId);

    Optional<PaymentMethod> findByUserIdAndAccountId(int i, int j);
}
