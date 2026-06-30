package com.fdmgroup.SmartPay_BackEnd.exception.card;

public class CardLockActionsRequiresUserRoleException extends RuntimeException {

    public CardLockActionsRequiresUserRoleException() {
        super("ROLE_USER required for lock actions");
    }

    public CardLockActionsRequiresUserRoleException(String message) {
        super(message);
    }
}
