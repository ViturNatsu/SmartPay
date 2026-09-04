package com.fdmgroup.SmartPay_BackEnd.services.payee.billing;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import com.fdmgroup.SmartPay_BackEnd.Utility.TransactionExecutor;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationTier;
import com.fdmgroup.SmartPay_BackEnd.Utility.notification.NotificationType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationCreateRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingFailureReason;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.exception.card.IllegalCardChargeException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringBillingChargeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.services.notification.NotificationService;

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

            // the markCompleted method might need to be changed as it is confusing whether the second parameter is strictly a transactionId.
            markCompleted(charge, "RCP-" + charge.getProviderReferenceId());
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
        } catch (InsufficientFundsException ex) {
            
            charge.setFailureReason(RecurringBillingFailureReason.INSUFFICIENT_FUNDS);
            markFailed(charge);

            NotificationCreateRequestDTO notification = new NotificationCreateRequestDTO();
            notification.setUserId(request.getOwnerUserId());
            notification.setType(NotificationType.WARNING);
            notification.setTitle("Charge Unsuccessful");
            notification.setDetail(ex.getMessage());
            //TODO: to be validate if it's t1
            notification.setTier(NotificationTier.T1.getValue());

            notificationService.createNotification(notification);

            log.warn(
                    "Recurring billing rejected for payee {} cycle {} on processing date {}: {}",
                    recurringPayee.getPayeeId(),
                    charge.getBillingCycleDate(),
                    charge.getStatus(),
                    charge.getFailureReason(),
                    processingDate,
                    ex.getMessage());
            return BillingChargeOutcome.FAILED;
        } catch (InvalidWithdrawAmountException ex){
            
            if(ex.getMessage().contains("wallet daily spending limit")){
                charge.setFailureReason(RecurringBillingFailureReason.DAILY_LIMIT_EXCEEDED);
            }
            else {
                charge.setFailureReason(RecurringBillingFailureReason.PER_TRANSACTION_LIMIT_EXCEEDED);
            }
            markFailed(charge);

            NotificationCreateRequestDTO notification = new NotificationCreateRequestDTO();
            notification.setUserId(request.getOwnerUserId());
            notification.setType(NotificationType.WARNING);
            notification.setTitle("Charge Unsuccessful");
            notification.setDetail(ex.getMessage());
            //TODO: to be validate if it's t1
            notification.setTier(NotificationTier.T1.getValue());

            notificationService.createNotification(notification);

            log.warn(
                    "Recurring billing rejected for payee {} cycle {} on processing date {}: {}",
                    recurringPayee.getPayeeId(),
                    charge.getBillingCycleDate(),
                    charge.getStatus(),
                    charge.getFailureReason(),
                    processingDate,
                    ex.getMessage());
            return BillingChargeOutcome.FAILED;
        } catch (IllegalCardChargeException ex){
            
            if(ex.failureReason == RecurringBillingFailureReason.CARD_LOCKED){
                charge.setFailureReason(RecurringBillingFailureReason.CARD_LOCKED);
            }
            else if(ex.failureReason == RecurringBillingFailureReason.CARD_PENDING_REQUEST){
                charge.setFailureReason(RecurringBillingFailureReason.CARD_PENDING_REQUEST);
            }
            markFailed(charge);

            NotificationCreateRequestDTO notification = new NotificationCreateRequestDTO();
            notification.setUserId(request.getOwnerUserId());
            notification.setType(NotificationType.WARNING);
            notification.setTitle("Charge Unsuccessful");
            notification.setDetail(ex.getMessage());
            //TODO: to be validate if it's t1
            notification.setTier(NotificationTier.T1.getValue());

            notificationService.createNotification(notification);

            log.warn(
                    "Recurring billing rejected for payee {} cycle {} on processing date {}: {}",
                    recurringPayee.getPayeeId(),
                    charge.getBillingCycleDate(),
                    charge.getStatus(),
                    charge.getFailureReason(),
                    processingDate,
                    ex.getMessage());
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
