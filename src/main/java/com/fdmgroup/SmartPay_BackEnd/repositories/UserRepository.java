package com.fdmgroup.SmartPay_BackEnd.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

public interface UserRepository extends JpaRepository<User, Long>{
    /**
     * US-F02-02-01 (Sign In)
     * Lookup user by unique email address for authentication.
     */
    Optional<User> findByEmail(String email);
}
