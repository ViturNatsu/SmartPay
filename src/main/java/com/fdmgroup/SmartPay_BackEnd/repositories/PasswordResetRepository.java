package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, UUID> {
    Optional<PasswordReset> findByEmail(String email);

}
