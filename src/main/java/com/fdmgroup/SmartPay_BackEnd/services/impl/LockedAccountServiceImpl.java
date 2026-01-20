package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.LockedAccount;
import com.fdmgroup.SmartPay_BackEnd.repositories.LockedAccountRepository;
import com.fdmgroup.SmartPay_BackEnd.services.LockedAccountService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LockedAccountServiceImpl implements LockedAccountService {
	private LockedAccountRepository lockedAccountRepo;

	@Override
	public LockedAccount AddLockedAccount(LockedAccount account) {
		return lockedAccountRepo.save(account);
	}

	@Override
	public Optional<LockedAccount> findLatestEntryByEmail(String email) {
		return lockedAccountRepo.findLatestEntryByEmail(email);
	}
}
