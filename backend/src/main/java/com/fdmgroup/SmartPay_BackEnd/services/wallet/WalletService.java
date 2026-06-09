package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Service
public interface WalletService {

    /**
     * Returns the wallet for the given user, creating one if it does not yet exist.
     */
    Wallet getWalletByUserId(long userId);

    /**
     * Deducts the requested amount from the user's wallet, persists a
     * {@code WalletTransaction} record with a unique UUID transaction ID, and
     * returns a {@code WithdrawResponseDTO} containing the transaction ID and
     * updated balance. Throws {@code InvalidWithdrawAmountException} when the
     * amount is ≤ 0, and {@code InsufficientFundsException} when the amount
     * exceeds the current balance.
     *
     * @param userId  the owner of the wallet
     * @param request DTO containing the amount and destination payment method ID
     */
    WithdrawResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request);
}
