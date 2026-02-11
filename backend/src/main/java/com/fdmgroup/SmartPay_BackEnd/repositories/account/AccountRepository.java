package com.fdmgroup.SmartPay_BackEnd.repositories.account;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
}