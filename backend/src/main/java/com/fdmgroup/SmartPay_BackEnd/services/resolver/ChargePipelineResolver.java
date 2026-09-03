package com.fdmgroup.SmartPay_BackEnd.services.resolver;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.BillChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.ChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.SubscriptionChargePipeline;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


/**

 Resolves the appropriate {@link ChargePipeline} for a

 {@link RecurringChargeRequest} based on its charge type.

 <p>The resolver currently uses only the request type to determine
 which pipeline should process the request. The full request is
 accepted rather than only the type ~ this allows additional request
 properties to be considered in the future.
 */
@Component
@RequiredArgsConstructor
public class ChargePipelineResolver {

    private final BillChargePipeline billChargePipeline;
    private final SubscriptionChargePipeline subscriptionChargePipeline;


    /**

     Resolves the pipeline responsible for processing the given request.

     @param requestContext the recurring charge request used to determine
     the appropriate pipeline

     @return the {@link ChargePipeline} corresponding to the request type
     */
    public ChargePipeline resolve(RecurringChargeRequest requestContext) {

        return switch (requestContext.getType()) {
            case BILL ->  billChargePipeline;
            case SUBSCRIPTION -> subscriptionChargePipeline;
        };
    }
}
