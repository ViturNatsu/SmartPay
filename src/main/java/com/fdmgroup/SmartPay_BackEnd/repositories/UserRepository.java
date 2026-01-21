package com.fdmgroup.SmartPay_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long>{
    // TODO
    @Query("SELECT u FROM User u WHERE u.email = :email")
    List<User> findByEmail(@Param("email") String email);
}
