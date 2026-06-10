package com.fdmgroup.SmartPay_BackEnd.services.system;

/*
 * This interface defines a scheduled task for renewing expired cards.
 * The implementation will be responsible for checking all cards and renewing those that have expired.
 */
public interface CardRenewalScheduler {
    void renewExpiredCards();
}
