package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

@Service
public class WalletServiceImpl implements WalletService {
    WalletRepository walletRepository;
    UserService userService;

    public WalletServiceImpl(WalletRepository walletRepository, UserService userService) {
        this.walletRepository = walletRepository;
        this.userService = userService;
    }

    @Override
    public Wallet getWalletByUserId(long userId) {
        Optional<Wallet> wallet = walletRepository.findByUserId(userId);
        if (wallet.isEmpty()) {
            //Create a new wallet for the user if it doesn't exist
            Wallet newWallet = new Wallet();
            newWallet.setUser(userService.getUserById(userId));
            newWallet.setBalance(0.0);
            return walletRepository.save(newWallet);
        }
        return wallet.get();
    }

    @Override
    @Transactional
    public void transfer(Long senderUserId, Long recipientUserId, Double amount, String memo) {
        Wallet senderWallet = getWalletByUserId(senderUserId);

        if (senderWallet.getBalance() < amount) {
            throw new InsufficientFundsException();
        }

        Wallet recipientWallet = getWalletByUserId(recipientUserId);

        senderWallet.setBalance(Math.round((senderWallet.getBalance() - amount) * 100.0) / 100.0);
        walletRepository.save(senderWallet);

        recipientWallet.setBalance(Math.round((recipientWallet.getBalance() + amount) * 100.0) / 100.0);
        walletRepository.save(recipientWallet);
    }
}
