package com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;

/**

 Defines a pipeline for processing a recurring charge request.

 <p>Implementations are responsible for performing the processing
 required for a specific recurring charge type.

 */
public interface ChargePipeline {

    /**

     Processes the given recurring charge request.

     @param requestContext the recurring charge request to process
     @return the result of processing the charge
     */
    ChargeExecutionResult execute(RecurringChargeRequest requestContext);
}
