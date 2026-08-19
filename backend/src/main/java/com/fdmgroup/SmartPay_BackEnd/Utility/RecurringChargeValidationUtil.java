package com.fdmgroup.SmartPay_BackEnd.Utility;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;

import java.time.LocalDate;

public final class RecurringChargeValidationUtil {
    private RecurringChargeValidationUtil() {
    }

    public static void validate(Wallet wallet, double amount, LocalDate processingDate) {
        validatePerTransactionLimit(wallet, amount);
        validateDailySpendingLimit(wallet, amount, processingDate);
        validateAvailableBalance(wallet, amount);
    }

    private static void validatePerTransactionLimit(Wallet wallet, double amount) {
        if (wallet.getPerTransactionLimit() != null && amount > wallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet per-transaction limit of $"
                            + String.format(
                            "%.2f",
                            wallet.getPerTransactionLimit()));
        }
    }

    private static void validateDailySpendingLimit(Wallet wallet, double amount, LocalDate processingDate) {
        if (wallet.getDailySpendingLimit() == null) {
            return;
        }

        double dailySpentAmount = getDailySpentAmountForDate(wallet, processingDate);

        if (dailySpentAmount + amount > wallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException("This transaction exceeds your wallet daily spending limit of $"
                    + String.format("%.2f", wallet.getDailySpendingLimit()));
        }
    }

    private static void validateAvailableBalance(Wallet wallet, double amount) {
        if (wallet.getBalance() == null || amount > wallet.getBalance()) {
            throw new InsufficientFundsException("Insufficient wallet balance");
        }
    }


    private static double getDailySpentAmountForDate(Wallet wallet, LocalDate processingDate) {
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(processingDate)) {
            return 0.0;
        }

        return wallet.getDailySpentAmount();
    }
}
