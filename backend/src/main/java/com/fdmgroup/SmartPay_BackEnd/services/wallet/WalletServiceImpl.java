package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.services.paymentmethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

@Service
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserService userService;
    private final PaymentMethodService paymentMethodService;

    public WalletServiceImpl(WalletRepository walletRepository,
                             UserService userService,
                             PaymentMethodService paymentMethodService) {
        this.walletRepository = walletRepository;
        this.userService = userService;
        this.paymentMethodService = paymentMethodService;
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

    /**
     * Validates the requested amount, verifies the destination payment method
     * belongs to the user, deducts the amount and persists the updated wallet.
     *
     * Validation order (matches Scenarios 7 & 8):
     *  1. amount must not be null or ≤ 0
     *  2. amount must not exceed the current wallet balance
     *  3. destination payment method must be active and owned by the user
     */
    @Override
    @Transactional
    public Wallet withdrawFunds(long userId, WithdrawRequestDTO request) {
        // Scenario 8: reject zero / negative / null amounts
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        Wallet wallet = getWalletByUserId(userId);

        // Scenario 7: reject amounts that exceed available balance
        if (request.getAmount() > wallet.getBalance()) {
            throw new InsufficientFundsException(
                "You cannot withdraw more than the Wallet balance of $"
                + String.format("%.2f", wallet.getBalance()));
        }

        // Verify the destination payment method is active and belongs to this user
        PaymentMethod paymentMethod = paymentMethodService.findPaymentMethodById(request.getPaymentMethodId());
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new InvalidWithdrawAmountException("Payment method does not belong to this user");
        }
        if (Boolean.FALSE.equals(paymentMethod.getActive())) {
            throw new InvalidWithdrawAmountException("Selected payment method is not active");
        }

        // Deduct the amount and persist
        wallet.setBalance(wallet.getBalance() - request.getAmount());
        return walletRepository.save(wallet);
    }
}
