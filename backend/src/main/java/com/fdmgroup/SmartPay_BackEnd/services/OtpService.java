package com.fdmgroup.SmartPay_BackEnd.services;

import java.util.Optional;

import org.springframework.http.HttpStatus;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.OtpDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.Otp;

import jakarta.servlet.http.HttpServletRequest;

public interface OtpService {

	Optional<Otp> findByEmailAndOtpType(String email, EventType otpType);

	Otp save(Otp otp);

	HttpStatus requestOtp(String email, EventType type, HttpServletRequest httpRequest);

	Otp verifyOtp(OtpDTO payload, HttpServletRequest httpRequest);

}
