package com.fdmgroup.SmartPay_BackEnd.services.payment;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;

/**

 Defines the service responsible for processing bill payments
 from recurring charge requests.

 */
public interface BillPaymentService {

    /**

     Processes a bill payment for the given recurring charge request.

     @param requestContext the recurring charge request containing
     the details required to process the payment
     @return the result of the bill payment execution
     */
    ChargeExecutionResult payBill(RecurringChargeRequest requestContext);
}
