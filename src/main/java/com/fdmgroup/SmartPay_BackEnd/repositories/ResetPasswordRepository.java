package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Reset_password;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.ScopedValue;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResetPasswordRepository extends JpaRepository<Reset_password, UUID> {
    Optional<Reset_password> findByTokenHashAndType(String tokenHash, Reset_password.TokenType type);
}
