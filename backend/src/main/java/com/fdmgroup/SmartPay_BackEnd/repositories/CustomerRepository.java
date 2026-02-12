package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Customer;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Optional<Customer> findByUser(User user);
    @Query("SELECT c FROM Customer c WHERE c.user.id = :userId")
    Optional<Customer> findByUserId(@Param("userId") Long userId);
}
