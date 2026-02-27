package com.fdmgroup.SmartPay_BackEnd.repositories.account;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND TYPE(a) = :clazz")
    List<Account> findByUserIdAndClazz(
            @Param("userId") Long userId,
            @Param("clazz") Class<? extends Account> clazz
    );

    @Query(value = "SELECT NEXT VALUE FOR ACCOUNT_NUMBER_SEQ", nativeQuery = true)
    Long getNextAccountNumberSequence();
}