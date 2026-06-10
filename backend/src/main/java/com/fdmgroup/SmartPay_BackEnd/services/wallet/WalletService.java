package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;
@Service
public interface WalletService {

    Wallet createWallet(long userId);

    /**
     * Returns the wallet for the given user, creating one if it does not yet exist.
     */
    WalletResponseDTO getWalletByUserId(long userId);

    /**
     * Deducts the requested amount from the user's wallet and returns the
     * updated Wallet. Throws {@code InvalidWithdrawAmountException} when the
     * amount is ≤ 0, and {@code InsufficientFundsException} when the amount
     * exceeds the current balance.
     *
     * @param userId  the owner of the wallet
     * @param request DTO containing the amount and destination payment method ID
     */
    WalletResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request);

    Wallet loadFunds(long userId, LoadWalletRequestDTO request);

    List<WalletTransactionDTO> getTransactions(long userId, int limit);


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
    WalletResponseDTO  updateDailySpendingLimit(long userId, WalletDailyLimitRequestDTO request);

    /**
     * Updates the wallet-level per-transaction spending limit for the specified user.
     *
     * The per-transaction limit applies to any single outgoing wallet transaction,
     * regardless of which linked funding source is used.
     *
     * @param userId the owner of the wallet
     * @param request DTO containing the new per-transaction limit value
     * @return the updated wallet  RESPONSE
     */
    WalletResponseDTO  updatePerTransactionLimit(long userId, WalletPerTransactionLimitRequestDTO request);

    void transfer(Long senderUserId, Long recipientUserId, Double amount, String memo);
}
