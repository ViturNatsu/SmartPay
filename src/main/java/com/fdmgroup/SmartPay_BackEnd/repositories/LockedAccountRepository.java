package com.fdmgroup.SmartPay_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;

public interface LockedAccountRepository extends JpaRepository<LockedAccount,Long> {
	
}
