package com.fdmgroup.SmartPay_BackEnd.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;

public interface LockedAccountRepository extends JpaRepository<LockedAccount,Long> {
	Optional<LockedAccount> findFirstByEmailOrderByLockedAtDesc(String email);
}