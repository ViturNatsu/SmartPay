package com.fdmgroup.SmartPay_BackEnd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartPayBackEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartPayBackEndApplication.class, args);
	}

}
