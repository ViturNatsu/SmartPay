package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;
import com.fdmgroup.SmartPay_BackEnd.repositories.wallet.WalletTransactionRepository;
import com.fdmgroup.SmartPay_BackEnd.services.pipeline.recurringPayments.ChargePipeline;
import com.fdmgroup.SmartPay_BackEnd.services.resolver.ChargePipelineResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentClient implements PaymentProviderClient {

    static final String RECURRING_TXN_PREFIX = "RCP-";
    private final WalletTransactionRepository walletTransactionRepository;
    private final ChargePipelineResolver chargePipelineResolver;

    @Override
    public ChargeExecutionResult executeCharge(RecurringChargeRequest request){

        String providerReferenceId = request.getProviderReferenceId();
        String transactionId = toTransactionId(providerReferenceId);

        Optional<WalletTransaction> existing = walletTransactionRepository.findByTransactionId(transactionId);

        if(existing.isPresent()){
            return new ChargeExecutionResult(providerReferenceId, existing.get().getTransactionId());
        }

        ChargePipeline chargePipeline = chargePipelineResolver.resolve(request);

        return chargePipeline.execute(request);
    }

    @Override
    public boolean confirmChargeSucceeded(String providerReferenceID) {
        if (providerReferenceID == null || providerReferenceID.isBlank()) {
            return false;
        }

        return walletTransactionRepository.findByTransactionId(toTransactionId(providerReferenceID)).isPresent();
    }

    private static String toTransactionId(String providerReferenceId) {
        return RECURRING_TXN_PREFIX + providerReferenceId;
    }
}
