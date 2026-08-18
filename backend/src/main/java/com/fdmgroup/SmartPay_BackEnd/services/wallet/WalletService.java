package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionPageDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionPageDTO;
@Service
public interface WalletService {

    Wallet createWallet(long userId);

    /**
     * Returns the wallet for the given user, creating one if it does not yet exist.
     */
    WalletResponseDTO getWalletByUserId(long userId);

    /**
     * Deducts the requested amount from the user's wallet, persists a
     * {@code WalletTransaction} record with a unique UUID transaction ID, and
     * returns a {@code WithdrawResponseDTO} containing the transaction ID and
     * updated balance.
     */
    WithdrawResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request);

    /**
     * Applies a recurring purchase through the wallet debit path. This method is
     * intended for backend payment processing, not a user-facing controller.
     */
    void debitRecurringPayment(long userId, double amount, String counterpartyName,
            LocalDate processingDate);

    WalletResponseDTO loadFunds(long userId, LoadWalletRequestDTO request);

    WalletTransactionPageDTO getTransactions(
        long userId,
        int page,
        int limit,
        Boolean favourite,
        String search
    );

    /**
     * Updates the wallet-level daily spending limit for the specified user.
     *
     * The daily spending limit applies across the entire wallet and is shared
     * across all linked funding sources. Any outgoing wallet transaction will
     * count toward this limit.
     *
     * @param userId the owner of the wallet
     * @param request DTO containing the new daily spending limit value
     * @return the updated wallet RESPONSE
     */
    WalletResponseDTO updateDailySpendingLimit(long userId, WalletDailyLimitRequestDTO request);

    /**
     * Updates the wallet-level per-transaction spending limit for the specified user.
     *
     * The per-transaction limit applies to any single outgoing wallet transaction,
     * regardless of which linked funding source is used.
     *
     * @param userId the owner of the wallet
     * @param request DTO containing the new per-transaction limit value
     * @return the updated wallet RESPONSE
     */
    WalletResponseDTO updatePerTransactionLimit(long userId, WalletPerTransactionLimitRequestDTO request);

    WalletResponseDTO transfer(Long senderUserId, Long recipientUserId, BigDecimal amount, String memo);

    WalletTransactionDTO changeWalletTransactionFavouriteStatus(long userId, String walletTransactionId, boolean isFavourite);
}
