package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

public class WalletPerTransactionLimitRequestDTO {
    private Double perTransactionLimit;

    public Double getPerTransactionLimit() {
        return perTransactionLimit;
    }

    public void setPerTransactionLimit(Double perTransactionLimit) {
        this.perTransactionLimit = perTransactionLimit;
    }
}
