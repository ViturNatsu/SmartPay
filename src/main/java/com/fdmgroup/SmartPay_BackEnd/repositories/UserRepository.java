package com.fdmgroup.SmartPay_BackEnd.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

public interface UserRepository extends JpaRepository<User, Long>{
    @Query("SELECT u FROM User u WHERE u.email = :email LIMIT 1")
    Optional<User> findByEmail(@Param("email") String email);
}
