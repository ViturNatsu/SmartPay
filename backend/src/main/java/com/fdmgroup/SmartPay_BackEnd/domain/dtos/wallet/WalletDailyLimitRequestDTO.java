package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

public class WalletDailyLimitRequestDTO {
    
    private Double dailySpendingLimit;

    public Double getDailySpendingLimit() {
        return dailySpendingLimit;
    }

    public void setDailySpendingLimit(Double dailySpendingLimit) {
        this.dailySpendingLimit = dailySpendingLimit;
    }
}
