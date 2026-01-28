package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;

public interface OtpService {
	
	Optional<Otp> findByEmailAndType(String email, Otp.OtpType otpType);
	
	Otp createOtp(Otp otp);
	
	Otp updateOtp(Otp otp);

}
