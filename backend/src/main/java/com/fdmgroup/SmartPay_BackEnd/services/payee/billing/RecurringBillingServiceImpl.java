package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidRecurringPayeeException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringBillingChargeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringBillingServiceImpl implements RecurringBillingService {

    private final RecurringPayeeRepository recurringPayeeRepository;
    private final RecurringBillingChargeRepository chargeRepository;
    private final PaymentProviderClient paymentProviderClient;

    @Override
    public void processDuePaymentsForDate(LocalDate processingDate) {
        List<RecurringPayee> activePayees = recurringPayeeRepository.findByActiveTrue();
        for (RecurringPayee payee : activePayees) {
            RecurringBillingScheduleUtil.resolveDueBillingCycleDate(payee, processingDate)
                    .ifPresent(cycleDate -> {
                        try {
                            processDuePayment(payee, cycleDate);
                        } catch (RuntimeException ex) {
                            log.warn(
                                    "Recurring billing failed for payee {} cycle {}: {}",
                                    payee.getPayeeId(),
                                    cycleDate,
                                    ex.getMessage());
                        }
                    });
        }
    }

    @Override
    @Transactional
    public BillingChargeOutcome processDuePayment(RecurringPayee recurringPayee, LocalDate billingCycleDate) {
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(
                recurringPayee.getPayeeId(),
                billingCycleDate);

        Optional<RecurringBillingCharge> existing = chargeRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return handleExistingCharge(existing.get(), recurringPayee);
        }

        RecurringBillingCharge charge = createInProgressCharge(recurringPayee, billingCycleDate, idempotencyKey);
        try {
            chargeRepository.saveAndFlush(charge);
        } catch (DataIntegrityViolationException ex) {
            return processDuePayment(recurringPayee, billingCycleDate);
        }

        return executeAndComplete(charge, recurringPayee);
    }

    private BillingChargeOutcome handleExistingCharge(
            RecurringBillingCharge charge,
            RecurringPayee recurringPayee) {
        if (charge.getStatus() == RecurringBillingStatus.COMPLETED) {
            return BillingChargeOutcome.ALREADY_COMPLETED;
        }

        if (paymentProviderClient.confirmChargeSucceeded(charge.getProviderReferenceId())) {
            markCompleted(charge, WalletPaymentProviderClient.toTransactionId(charge.getProviderReferenceId()));
            return BillingChargeOutcome.RECOVERED_AFTER_CRASH;
        }

        return executeAndComplete(charge, recurringPayee);
    }

    private BillingChargeOutcome executeAndComplete(
            RecurringBillingCharge charge,
            RecurringPayee recurringPayee) {
        RecurringChargeRequest request = RecurringChargeRequest.builder()
                .recurringPayee(recurringPayee)
                .type(recurringPayee.getType())
                .ownerUserId(recurringPayee.getOwner().getId())
                .recipientUserId(recurringPayee.getRecipient().getId())
                .amount(charge.getAmount())
                .providerReferenceId(charge.getProviderReferenceId())
                .build();

        ChargeExecutionResult result = paymentProviderClient.executeCharge(request);
        markCompleted(charge, result.getWalletTransactionId());
        calculateAndSaveNextScheduledPayment(recurringPayee);
        return BillingChargeOutcome.CHARGED;
    }

    private void markCompleted(RecurringBillingCharge charge, String walletTransactionId) {
        charge.setStatus(RecurringBillingStatus.COMPLETED);
        charge.setWalletTransactionId(walletTransactionId);
        chargeRepository.save(charge);
    }

    private RecurringBillingCharge createInProgressCharge(
            RecurringPayee recurringPayee,
            LocalDate billingCycleDate,
            String idempotencyKey) {
        String chargeId = UUID.randomUUID().toString();

        RecurringBillingCharge charge = new RecurringBillingCharge();
        charge.setChargeId(chargeId);
        charge.setIdempotencyKey(idempotencyKey);
        charge.setRecurringPayee(recurringPayee);
        charge.setBillingCycleDate(billingCycleDate);
        charge.setAmount(recurringPayee.getAmount());
        charge.setStatus(RecurringBillingStatus.IN_PROGRESS);
        charge.setProviderReferenceId(chargeId);
        return charge;
    }

    private void calculateAndSaveNextScheduledPayment(RecurringPayee recurringPayee){
        LocalDate paymentDate = recurringPayee.getDate();
        Schedule schedule = recurringPayee.getSchedule();

        if(!recurringPayee.isActive()){
            throw new InvalidRecurringPayeeException("Can't update inactive account");
        }

        switch (schedule) {
                case WEEKLY -> paymentDate = paymentDate.plusWeeks(1);
                case BIWEEKLY -> paymentDate = paymentDate.plusWeeks(2);
                case MONTHLY -> paymentDate = paymentDate.plusMonths(1);
                case YEARLY -> paymentDate = paymentDate.plusYears(1);
        }

        recurringPayee.setDate(paymentDate);
        recurringPayeeRepository.save(recurringPayee);
    }
}
