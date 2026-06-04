package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import org.springframework.stereotype.Service;

import java.util.List;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Service
public interface WalletService {

    Wallet getWalletByUserId(long userId);

    Wallet loadFunds(long userId, LoadWalletRequestDTO request);

    Wallet withdrawFunds(long userId, WithdrawRequestDTO request);

    List<WalletTransactionDTO> getTransactions(long userId, int limit);
}
