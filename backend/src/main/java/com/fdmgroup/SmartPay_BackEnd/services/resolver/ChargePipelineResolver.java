package com.fdmgroup.SmartPay_BackEnd.services.resolver;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.BillChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.ChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.SubscriptionChargePipeline;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class ChargePipelineResolver {

    private final BillChargePipeline billChargePipeline;
    private final SubscriptionChargePipeline subscriptionChargePipeline;


    public ChargePipeline resolve(RecurringChargeRequest requestContext) {

        // Currently, only the type is necessary to determine which pipeline the request will trigger.
        // However, this may not be the case in the future
        // - which is why the resolve function takes in the entire request instead of only the type.

        return switch (requestContext.getType()) {
            case BILL ->  billChargePipeline;
            case SUBSCRIPTION -> subscriptionChargePipeline;
        };
    }
}
