package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import org.springframework.http.HttpStatus;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp.OtpType;

public interface OtpService {

	Optional<Otp> findByEmailAndOtpType(String email, OtpType otpType);

	Otp save(Otp otp);

	HttpStatus requestOtp(String email, OtpType type);

	Otp verifyOtp(OtpDTO payload);

}
