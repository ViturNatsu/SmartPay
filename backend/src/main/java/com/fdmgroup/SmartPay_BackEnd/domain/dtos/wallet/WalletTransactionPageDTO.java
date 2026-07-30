package com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WalletTransactionPageDTO {

    private List<WalletTransactionDTO> transactions;

    private int currentPage;

    private int pageSize;

    private int totalPages;

    private long totalElements;

    private boolean hasNext;

    private boolean hasPrevious;
}