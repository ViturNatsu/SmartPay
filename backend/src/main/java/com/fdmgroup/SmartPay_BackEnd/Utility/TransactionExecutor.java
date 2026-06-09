package com.fdmgroup.SmartPay_BackEnd.Utility;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class TransactionExecutor {

    private final TransactionTemplate transactionTemplate;

    /**
     * Executes a code snippet within a Transaction context. When any error is raised within the action,
     * the entire snippet is rolls-back, preserving Database integrity.
     *
     * @param action The code snippet that is run within a Transaction context.
     */
    public void execute(Runnable action) {
        transactionTemplate.executeWithoutResult(status -> {
            action.run();
        });
    }
}

