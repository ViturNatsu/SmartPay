package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Service
public interface WalletService {

    Wallet getWalletByUserId(long userId);

    Wallet loadFunds(long userId, LoadWalletRequestDTO request);

    Wallet withdrawFunds(long userId, WithdrawRequestDTO request);
}
