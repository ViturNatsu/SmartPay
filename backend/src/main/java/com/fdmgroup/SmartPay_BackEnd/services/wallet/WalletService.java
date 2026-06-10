package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

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

    Wallet loadFunds(long userId, LoadWalletRequestDTO request);

    List<WalletTransactionDTO> getTransactions(long userId, int limit);
}
