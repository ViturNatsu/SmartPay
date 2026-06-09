package com.fdmgroup.SmartPay_BackEnd.repositories.wallet;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.wallet.wallet_id = :walletId")
    List<WalletTransaction> findByWalletId(@Param("walletId") Long walletId);
}
