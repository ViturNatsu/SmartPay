package com.fdmgroup.SmartPay_BackEnd.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;

public interface LockedAccountRepository extends JpaRepository<LockedAccount,Long> {
	@Query("SELECT LockedAccount FROM locked_accounts a "
			+ "WHERE a.email = email "
			+ "ORDER BY e.locked_at DESC LIMIT 1")
	Optional<LockedAccount> findLatestEntryByEmail(String email);
}