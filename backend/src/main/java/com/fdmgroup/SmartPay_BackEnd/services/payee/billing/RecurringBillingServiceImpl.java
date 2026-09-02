package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.fdmgroup.SmartPay_BackEnd.Utility.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.TransactionExecutor;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
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
    private final TransactionExecutor transactionExecutor;
    private final NotificationService notificationService;

    @Override
    public void processDuePaymentsForDate(LocalDate processingDate) {
        List<RecurringPayee> activePayees = recurringPayeeRepository
                .findByActiveTrueAndStatus(RecurringPaymentStatus.ACTIVE);
        for (RecurringPayee payee : activePayees) {
            RecurringBillingScheduleUtil.resolveDueBillingCycleDate(payee, processingDate)
                    .ifPresent(cycleDate -> {
                        try {
                            processDuePayment(payee, cycleDate, processingDate);
                        } catch (RuntimeException ex) {
                            log.warn(
                                    "Recurring billing failed for payee {} cycle {} on processing date {}: {}",
                                    payee.getPayeeId(),
                                    cycleDate,
                                    processingDate,
                                    ex.getMessage());
                        }
                    });
        }
    }

    @Override
    public BillingChargeOutcome processDuePayment(RecurringPayee payee, LocalDate cycleDate) {
        return processDuePayment(payee, cycleDate, LocalDate.now());
    }


    private BillingChargeOutcome processDuePayment(RecurringPayee recurringPayee, LocalDate billingCycleDate,  LocalDate processingDate) {
        String idempotencyKey = RecurringBillingScheduleUtil.buildIdempotencyKey(
                recurringPayee.getPayeeId(),
                billingCycleDate);

        Optional<RecurringBillingCharge> existing = chargeRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            return handleExistingCharge(existing.get(), recurringPayee, processingDate);
        }

        RecurringBillingCharge charge = createInProgressCharge(recurringPayee, billingCycleDate, idempotencyKey);
        try {
            chargeRepository.saveAndFlush(charge);
        } catch (DataIntegrityViolationException ex) {
            return processDuePayment(recurringPayee, billingCycleDate, processingDate);
        }

        return executeAndComplete(charge, recurringPayee, processingDate);
    }

    private BillingChargeOutcome handleExistingCharge(
            RecurringBillingCharge charge,
            RecurringPayee recurringPayee,
            LocalDate processingDate) {
        if (charge.getStatus() == RecurringBillingStatus.COMPLETED) {
            return BillingChargeOutcome.ALREADY_COMPLETED;
        }

        if (paymentProviderClient.confirmChargeSucceeded(charge.getProviderReferenceId())) {
            markCompleted(charge, WalletPaymentProviderClient.toTransactionId(charge.getProviderReferenceId()));
            return BillingChargeOutcome.RECOVERED_AFTER_CRASH;
        }

        return executeAndComplete(charge, recurringPayee, processingDate);
    }

    private BillingChargeOutcome executeAndComplete(
            RecurringBillingCharge charge,
            RecurringPayee recurringPayee,
            LocalDate processingDate) {
        RecurringChargeRequest request = RecurringChargeRequest.builder()
                .recurringPayee(recurringPayee)
                .type(recurringPayee.getType())
                .ownerUserId(recurringPayee.getOwner().getId())
                .recipientUserId(recurringPayee.getRecipient().getId())
                .amount(charge.getAmount())
                .providerReferenceId(charge.getProviderReferenceId())
                .processingDate(processingDate)
                .build();
        try {
            transactionExecutor.execute(() -> {
                ChargeExecutionResult result = paymentProviderClient.executeCharge(request);
                markCompleted(charge, result.getWalletTransactionId());
                calculateAndSaveNextScheduledPayment(recurringPayee);
            });
            return BillingChargeOutcome.CHARGED;
        } catch (InsufficientFundsException | InvalidWithdrawAmountException ex) {
            log.warn(
                    "Recurring billing rejected for payee {} cycle {} on processing date {}: {}",
                    recurringPayee.getPayeeId(),
                    charge.getBillingCycleDate(),
                    processingDate,
                    ex.getMessage());
            markFailed(charge);

            notificationService.createNotification(
                    request.getOwnerUserId(),
                    NotificationType.WARNING,
                    "Charge Unsuccessful",
                    ex.getMessage()
            );

            return BillingChargeOutcome.FAILED;
        }
    }

    private void markCompleted(RecurringBillingCharge charge, String walletTransactionId) {
        charge.setStatus(RecurringBillingStatus.COMPLETED);
        charge.setWalletTransactionId(walletTransactionId);
        chargeRepository.save(charge);
    }

    private void markFailed(RecurringBillingCharge charge) {
        charge.setStatus(RecurringBillingStatus.FAILED);
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
        charge.setAmount(recurringPayee.getAmount().doubleValue());
        charge.setStatus(RecurringBillingStatus.IN_PROGRESS);
        charge.setProviderReferenceId(chargeId);
        return charge;
    }

    private void calculateAndSaveNextScheduledPayment(RecurringPayee recurringPayee){
        LocalDate paymentDate = recurringPayee.getDate();
        Schedule schedule = recurringPayee.getSchedule();

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
