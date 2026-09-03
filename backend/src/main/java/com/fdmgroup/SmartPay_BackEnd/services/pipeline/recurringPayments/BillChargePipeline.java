package com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringChargeValidationUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringChargeRequest;
import com.fdmgroup.SmartPay_BackEnd.services.payment.BillPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;


/**
 * Pipeline responsible for validating and processing recurring bill charges.
 *
 * <p>Validates the sender's wallet and charge details before delegating
 * payment processing to the bill payment service.
 */
@Component
@RequiredArgsConstructor
public class BillChargePipeline implements ChargePipeline{

    private final WalletRepository walletRepository;
    private final BillPaymentService billPaymentService;
    private final RecurringChargeValidationUtil recurringChargeValidationUtil;

    /**
     Validates and processes a recurring bill charge.

     @param requestContext the recurring charge request to process
     @return the result of the bill payment execution
     */
    @Override
    public ChargeExecutionResult execute(RecurringChargeRequest requestContext) {

        // The pipeline currently contains a validate() and handleBillPayment() step.
        // Add features in the correct order ~ ex: preProcess(), postProcess().

        // preProcess(requestContext);
        validate(requestContext);
        return handleBillPayment(requestContext);
    }

    private void validate(RecurringChargeRequest requestContext){

        Wallet senderWallet = walletRepository.findByUserId((requestContext.getOwnerUserId()))
                .orElseThrow(()-> new IllegalStateException("Sender wallet not found"));

        recurringChargeValidationUtil.validate(
                senderWallet,
                requestContext.getAmount(),
                requestContext.getProcessingDate()
        );

        resetDailySpendIfNeeded(senderWallet, requestContext.getProcessingDate());
    }

    private ChargeExecutionResult handleBillPayment(RecurringChargeRequest requestContext) {
        return billPaymentService.payBill(requestContext);
    }

    private void resetDailySpendIfNeeded(Wallet wallet, LocalDate processingDate) {
        if (wallet.getDailySpentDate() == null || !wallet.getDailySpentDate().equals(processingDate)) {
            wallet.setDailySpentAmount(0.0);
            wallet.setDailySpentDate(processingDate);
        }
    }
}
