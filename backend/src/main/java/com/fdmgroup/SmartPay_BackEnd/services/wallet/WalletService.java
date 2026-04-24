package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;

@Service
public interface WalletService {

    Wallet getWalletByUserId(long userId);

}
