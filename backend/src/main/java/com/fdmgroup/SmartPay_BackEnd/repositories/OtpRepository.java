package com.fdmgroup.SmartPay_BackEnd.repositories;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findByEmailAndOtpType(String email, EventType otpType);

}
