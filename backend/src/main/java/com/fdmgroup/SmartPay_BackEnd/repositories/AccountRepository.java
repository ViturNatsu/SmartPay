package com.fdmgroup.SmartPay_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;

public interface AccountRepository extends JpaRepository<Account, Long>{
    // TODO
}
