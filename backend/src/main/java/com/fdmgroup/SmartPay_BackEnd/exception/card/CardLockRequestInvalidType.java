package com.fdmgroup.SmartPay_BackEnd.exception.card;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import org.springframework.http.HttpStatus;

public class CardLockRequestInvalidType extends RuntimeException {

    public CardLockRequestInvalidType() {
        super("Bad Request. Must be " + EventType.CARD_LOCK.toString() + " or " + EventType.CARD_UNLOCK.toString());
    }

    public CardLockRequestInvalidType(String message) {
        super(message);
    }

}
