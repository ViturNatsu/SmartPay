package com.fdmgroup.SmartPay_BackEnd.repositories.account;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("SELECT a FROM Account a JOIN a.users u WHERE u.id = :userId")
    List<Account> findByUserId(@Param("userId") Long userId);
    Optional<Account> findByAccountNumber(String accountNumber);
    
    @Query("SELECT a FROM Account a JOIN a.users u WHERE u.id = :userId AND TYPE(a) = :clazz")
    List<Account> findByUserIdAndClazz(
            @Param("userId") Long userId,
            @Param("clazz") Class<? extends Account> clazz
    );
    @Query(value = "SELECT NEXT VALUE FOR ACCOUNT_NUMBER_SEQ", nativeQuery = true)
    Long getNextAccountNumberSequence();

    @Query("SELECT a FROM Account a JOIN a.users u WHERE u.id = :userId")
    List<Account> findAllByUserId(@Param("userId") Long userId);
    @Query("SELECT DISTINCT pm.account FROM PaymentMethod pm WHERE pm.user.id = :userId AND pm.active = true")
    List<Account> findInUseAccountsByUserId(@Param("userId") Long userId);
}