package com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.payment.SubscriptionPaymentService;
import com.fdmgroup.SmartPay_BackEnd.services.payment.SubscriptionPaymentServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SubscriptionChargePipeline implements ChargePipeline {

    private final SubscriptionPaymentService subscriptionPaymentService;

    @Override
    public ChargeExecutionResult execute(RecurringChargeRequest requestContext) {
        validate();
        return handleSubscriptionPayment(requestContext);
    }

    private void validate(){
        // validation is yet to be implemented
    }

    private ChargeExecutionResult handleSubscriptionPayment(RecurringChargeRequest requestContext) {
        return subscriptionPaymentService.paySubscription(requestContext);
    }
}
