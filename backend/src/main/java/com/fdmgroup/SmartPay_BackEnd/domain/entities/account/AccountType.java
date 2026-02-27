package com.fdmgroup.SmartPay_BackEnd.domain.entities.account;

public enum AccountType {
    SAVINGS(SavingsAccount.class),
    CHECKING(CheckingAccount.class);

    private final Class<? extends Account> entityClass;

    AccountType(Class<? extends Account> entityClass) {
        this.entityClass = entityClass;
    }

    public Class<? extends Account> getEntityClass() {
        return entityClass;
    }
}
