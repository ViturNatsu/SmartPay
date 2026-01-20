package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;

public interface LockedAccountService {
	LockedAccount AddLockedAccount(LockedAccount account);
	Optional<LockedAccount> findLatestLockEntry(String email);
}
