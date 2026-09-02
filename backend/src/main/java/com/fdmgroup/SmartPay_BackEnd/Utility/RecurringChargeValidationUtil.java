package com.fdmgroup.SmartPay_BackEnd.Utility;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.cardRequest.RequestStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.exception.card.IllegalCardChargeException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RecurringChargeValidationUtil {

    private final CardRequestService cardRequestService;

    public void validate(Wallet wallet, double amount, LocalDate processingDate) {
        validatePerTransactionLimit(wallet, amount);
        validateDailySpendingLimit(wallet, amount, processingDate);
        validateAvailableBalance(wallet, amount);
        validateCardHasNoPendingReplacement(wallet);
        validateCardIsNotLocked(wallet);
    }

    private void validatePerTransactionLimit(Wallet wallet, double amount) {
        if (wallet.getPerTransactionLimit() != null && amount > wallet.getPerTransactionLimit()) {
            throw new InvalidWithdrawAmountException(
                    "This transaction exceeds your wallet per-transaction limit of $"
                            + String.format(
                            "%.2f",
                            wallet.getPerTransactionLimit()));
        }
    }

    private void validateDailySpendingLimit(Wallet wallet, double amount, LocalDate processingDate) {
        if (wallet.getDailySpendingLimit() == null) {
            return;
        }

        double dailySpentAmount = getDailySpentAmountForDate(wallet, processingDate);

        if (dailySpentAmount + amount > wallet.getDailySpendingLimit()) {
            throw new InvalidWithdrawAmountException("This transaction exceeds your wallet daily spending limit of $"
                    + String.format("%.2f", wallet.getDailySpendingLimit()));
        }
    }

    private void validateAvailableBalance(Wallet wallet, double amount) {
        if (wallet.getBalance() == null || amount > wallet.getBalance()) {
            throw new InsufficientFundsException("Insufficient wallet balance");
        }
    }

    private double getDailySpentAmountForDate(Wallet wallet, LocalDate processingDate) {
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(processingDate)) {
            return 0.0;
        }

        return wallet.getDailySpentAmount();
    }

    private void validateCardIsNotLocked(Wallet wallet) {
        Card card = wallet.getCard();
        CardStatus status = card.getStatus();

        // raise exception if status is locked
        if( card.getStatus() == CardStatus.LOCKED){
            throw new IllegalCardChargeException("Card is currently locked and cannot be charged.", 0);
        }

    }

    private void validateCardHasNoPendingReplacement(Wallet wallet) {

        if(cardRequestService.CardHasPendingRequest(wallet.getCard())){
            throw new IllegalCardChargeException("Card has a pending charge request", 1);
        }

    }
}
