package com.fdmgroup.SmartPay_BackEnd.repositories.wallet;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long>{

    Optional<Wallet> findByUserId(long userId);

}
