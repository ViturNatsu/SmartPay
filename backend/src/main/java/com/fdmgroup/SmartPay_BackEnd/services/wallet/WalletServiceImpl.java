package com.fdmgroup.SmartPay_BackEnd.services.wallet;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.LoadWalletRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.services.paymentmethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

@Service
public class WalletServiceImpl implements WalletService {

    private static final String INSUFFICIENT_BANK_FUNDS_MESSAGE =
            "Insufficient funds in this account. Please check your bank balance and try again.";

    private final WalletRepository walletRepository;
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final UserService userService;
    private final PaymentMethodService paymentMethodService;

    public WalletServiceImpl(
            WalletRepository walletRepository,
            PaymentRepository paymentRepository,
            AccountRepository accountRepository,
            UserService userService,
            PaymentMethodService paymentMethodService) {
        this.walletRepository = walletRepository;
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
        this.userService = userService;
        this.paymentMethodService = paymentMethodService;
    }

    @Override
    public Wallet getWalletByUserId(long userId) {
        Optional<Wallet> wallet = walletRepository.findByUserId(userId);
        if (wallet.isEmpty()) {
            Wallet newWallet = new Wallet();
            newWallet.setUser(userService.getUserById(userId));
            newWallet.setBalance(0.0);
            return walletRepository.save(newWallet);
        }
        return wallet.get();
    }

    @Override
    @Transactional
    public Wallet loadFunds(long userId, LoadWalletRequestDTO request) {
        PaymentMethod paymentMethod = paymentRepository
                .findByPaymentMethodIdAndUser_Id(request.getPaymentMethodId(), userId)
                .orElseThrow(() -> new PaymentMethodNotFoundException("Payment method not found"));

        if (!Boolean.TRUE.equals(paymentMethod.getActive())) {
            throw new PaymentMethodNotFoundException("Payment method not found");
        }

        Account account = paymentMethod.getAccount();
        double amount = request.getAmount();
        double accountBalance = account.getBalance() != null ? account.getBalance() : 0.0;

        if (accountBalance < amount) {
            throw new InsufficientFundsException(INSUFFICIENT_BANK_FUNDS_MESSAGE);
        }

        account.setBalance(accountBalance - amount);
        accountRepository.save(account);

        Wallet wallet = getWalletByUserId(userId);
        double walletBalance = wallet.getBalance() != null ? wallet.getBalance() : 0.0;
        wallet.setBalance(walletBalance + amount);
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public Wallet withdrawFunds(long userId, WithdrawRequestDTO request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new InvalidWithdrawAmountException("Amount must be greater than $0.00");
        }

        Wallet wallet = getWalletByUserId(userId);

        if (request.getAmount() > wallet.getBalance()) {
            throw new InsufficientFundsException(
                "You cannot withdraw more than the Wallet balance of $"
                + String.format("%.2f", wallet.getBalance()));
        }

        PaymentMethod paymentMethod = paymentMethodService.findPaymentMethodById(request.getPaymentMethodId());
        if (!paymentMethod.getUser().getId().equals(userId)) {
            throw new InvalidWithdrawAmountException("Payment method does not belong to this user");
        }
        if (Boolean.FALSE.equals(paymentMethod.getActive())) {
            throw new InvalidWithdrawAmountException("Selected payment method is not active");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        return walletRepository.save(wallet);
    }
}
