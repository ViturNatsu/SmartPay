package com.fdmgroup.SmartPay_BackEnd.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.repositories.OtpRepository;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class OtpServiceImpl implements OtpService {
	
	private OtpRepository repository;

	@Override
	public Optional<Otp> findByEmail(String email) {
		return repository.findByEmail(email);
	}

	@Override
	@Transactional
	public Otp createOtp(Otp otp) {
		return repository.save(otp);
	}

	@Override
	@Transactional
	public Otp updateOtp(Otp otp) {
		return repository.save(otp);
	}

}
