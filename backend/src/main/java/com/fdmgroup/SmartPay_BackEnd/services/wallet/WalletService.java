package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletResponseDTO;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletDailyLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletPerTransactionLimitRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Service
public interface WalletService {

    Wallet createWallet(long userId);

    WalletResponseDTO getWalletByUserId(long userId);

    WithdrawResponseDTO withdrawFunds(long userId, WithdrawRequestDTO request);

    WalletResponseDTO loadFunds(long userId, LoadWalletRequestDTO request);

    List<WalletTransactionDTO> getTransactions(long userId, int limit);

    WalletResponseDTO updateDailySpendingLimit(long userId, WalletDailyLimitRequestDTO request);

    WalletResponseDTO updatePerTransactionLimit(long userId, WalletPerTransactionLimitRequestDTO request);

    WalletResponseDTO transfer(Long senderUserId, Long recipientUserId, Double amount, String memo);
}
