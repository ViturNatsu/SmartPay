package com.fdmgroup.SmartPay_BackEnd.domain.entities.card;

public enum CardStatus {
    ACTIVE, // Currently in-use
    INACTIVE, // Possibly expired or deleted
    LOCKED
}
