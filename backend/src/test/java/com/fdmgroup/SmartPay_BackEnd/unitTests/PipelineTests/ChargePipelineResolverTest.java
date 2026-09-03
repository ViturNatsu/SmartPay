package com.fdmgroup.SmartPay_BackEnd.unitTests.PipelineTests;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.BillChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.ChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.SubscriptionChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.resolver.ChargePipelineResolver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertSame;

@ExtendWith(MockitoExtension.class)
public class ChargePipelineResolverTest {

    @Mock
    BillChargePipeline billChargePipeline;

    @Mock
    SubscriptionChargePipeline subscriptionChargePipeline;

    @InjectMocks
    ChargePipelineResolver chargePipelineResolver;

    @Test
    void ResolverReturnsTheCorrectResolver(){

        // build a request context with BILL as the type.
        RecurringChargeRequest request = RecurringChargeRequest.builder()
                .recurringPayee(new RecurringPayee())
                .type(RecurringPaymentType.BILL)
                .ownerUserId(1L)
                .recipientUserId(2L)
                .amount(20.0)
                .providerReferenceId("irrelevant")
                .processingDate(LocalDate.now())
                .build();

        ChargePipeline chargePipeline = chargePipelineResolver.resolve(request);

        assertSame(billChargePipeline, chargePipeline);

        // Build a request context with subscription as the type
        RecurringChargeRequest requestTwo = RecurringChargeRequest.builder()
                .recurringPayee(new RecurringPayee())
                .type(RecurringPaymentType.SUBSCRIPTION)
                .ownerUserId(1L)
                .recipientUserId(2L)
                .amount(20.0)
                .providerReferenceId("irrelevant")
                .processingDate(LocalDate.now())
                .build();

        chargePipeline = chargePipelineResolver.resolve(requestTwo);

        assertSame(subscriptionChargePipeline, chargePipeline);
    }
}
