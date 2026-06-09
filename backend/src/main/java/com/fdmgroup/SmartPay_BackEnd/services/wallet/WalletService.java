package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

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
}
