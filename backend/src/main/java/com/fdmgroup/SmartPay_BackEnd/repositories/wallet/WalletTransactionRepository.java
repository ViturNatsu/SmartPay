package com.fdmgroup.SmartPay_BackEnd.repositories.wallet;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.wallet.walletId = :walletId")
    List<WalletTransaction> findByWalletId(@Param("walletId") Long walletId);

    List<WalletTransaction> findByWallet_User_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
