package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.Optional;
import java.util.regex.Pattern;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.transaction.WalletTransactionDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.exception.transaction.InvalidWalletTransferAmount;
import com.fdmgroup.SmartPay_BackEnd.exception.transaction.InvalidWalletTransferMemo;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFound;
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

    private static final double EXCLUSIVE_MINIMUM_WALLET_TRANSFER_AMOUNT = 0.0;
    private static final double INCLUSIVE_MAXIMUM_WALLET_TRANSFER_AMOUNT = 3000.0;
    private static final String walletTransferMemoPattern ="[A-Za-z0-9]{0,100}";

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


    @Transactional
    @Override
    public void internalTransfer(WalletTransactionDTO req) {
        User sender = userService.getUserById(req.getSenderUserId());
        User receiver = userService.getUserById(req.getReceiverUserId());

        Wallet src = walletRepository.findByUserId(sender.getId()).orElseThrow(WalletNotFound::new);
        Wallet dst = walletRepository.findByUserId(receiver.getId()).orElseThrow(WalletNotFound::new);
        Double amount = req.getAmount();
        String memo = req.getMemo();

        if(EXCLUSIVE_MINIMUM_WALLET_TRANSFER_AMOUNT<=amount || amount < INCLUSIVE_MAXIMUM_WALLET_TRANSFER_AMOUNT){
            throw new InvalidWalletTransferAmount(amount);
        }else if(Pattern.matches(walletTransferMemoPattern, memo)){
            throw new InvalidWalletTransferMemo();
        }

        src.setBalance(src.getBalance() - amount);
        dst.setBalance(dst.getBalance() + amount);
    }
}
