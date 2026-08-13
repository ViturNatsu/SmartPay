package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecurringChargeRequest {

    private final RecurringPayee recurringPayee;
    private final RecurringPaymentType type;
    private final Long ownerUserId;
    private final Long recipientUserId;
    private final Double amount;
    private final String providerReferenceId;
}
