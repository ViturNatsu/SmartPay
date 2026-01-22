package com.fdmgroup.SmartPay_BackEnd.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

public interface UserRepository extends JpaRepository<User, Long>{
	Optional<User> findByEmail(String email);
}
