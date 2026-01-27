package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;

public interface OtpService {
	
	Optional<Otp> findByEmail(String email);
	
	Otp createOtp(Otp otp);
	
	Otp updateOtp(Otp otp);

}
