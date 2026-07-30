package com.fdmgroup.SmartPay_BackEnd.repositories.wallet;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.wallet.walletId = :walletId")
    List<WalletTransaction> findByWalletId(@Param("walletId") Long walletId);

    Page<WalletTransaction> findByWallet_User_IdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );
    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.transactionId = :transactionId")
    Optional<WalletTransaction> findByTransactionId(@Param("transactionId") String transactionId);

    Page<WalletTransaction> findByWallet_User_IdAndIsFavouriteTrueOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable
    );

    @Query("""
        SELECT wt
        FROM WalletTransaction wt
        WHERE wt.wallet.user.id = :userId
        AND (
                LOWER(COALESCE(wt.bankDisplayName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(wt.counterpartyName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(CAST(wt.type AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        ORDER BY wt.createdAt DESC
        """)
    Page<WalletTransaction> searchTransactions(
        @Param("userId") Long userId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT wt
        FROM WalletTransaction wt
        WHERE wt.wallet.user.id = :userId
        AND wt.isFavourite = true
        AND (
                LOWER(COALESCE(wt.bankDisplayName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(wt.counterpartyName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(CAST(wt.type AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        ORDER BY wt.createdAt DESC
        """)
    Page<WalletTransaction> searchFavouriteTransactions(
        @Param("userId") Long userId,
        @Param("search") String search,
        Pageable pageable
   );
    
}
