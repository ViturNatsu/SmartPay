package com.fdmgroup.SmartPay_BackEnd.services.payee;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.Utility.TransactionExecutor;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPaymentProcessResultDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringPaymentProcessorImpl implements RecurringPaymentProcessor {

    private final RecurringPayeeRepository recurringPayeeRepository;
    private final WalletService walletService;
    private final TransactionExecutor transactionExecutor;

    @Override
    public RecurringPaymentProcessResultDTO processDuePayments() {
        return processDuePayments(LocalDate.now(ZoneOffset.UTC));
    }

    @Override
    public RecurringPaymentProcessResultDTO processDuePayments(LocalDate invocationDate) {
        List<Long> duePaymentIds = recurringPayeeRepository.findDuePaymentIds(invocationDate);
        AtomicInteger processedCount = new AtomicInteger();

        for (Long paymentId : duePaymentIds) {
            try {
                transactionExecutor.execute(() -> processPayment(paymentId, invocationDate, processedCount));
            } catch (RuntimeException ignored) {
                // One failed charge must not prevent other due payments from processing.
            }
        }
        return new RecurringPaymentProcessResultDTO(invocationDate, processedCount.get());
    }

    private void processPayment(Long paymentId, LocalDate invocationDate, AtomicInteger processedCount) {
        RecurringPayee payment = recurringPayeeRepository.findByPayeeIdForProcessing(paymentId).orElse(null);
        if (!isDueAndActive(payment, invocationDate)) {
            return;
        }

        walletService.debitRecurringPayment(payment.getOwner().getId(), payment.getAmount(),
                payment.getPayeeName(), invocationDate);
        payment.setLastProcessedDate(invocationDate);
        payment.setDate(nextDateAfter(payment.getDate(), payment.getSchedule(), invocationDate));
        recurringPayeeRepository.save(payment);
        processedCount.incrementAndGet();
    }

    private boolean isDueAndActive(RecurringPayee payment, LocalDate invocationDate) {
        return payment != null
                && payment.isActive()
                && !payment.getDate().isAfter(invocationDate)
                && (payment.getEndDate() == null || !payment.getEndDate().isBefore(invocationDate)
                && (payment.getStatus() != RecurringPaymentStatus.PAUSED || payment.getStatus() != RecurringPaymentStatus.CANCELLED));
    }

    private LocalDate nextDateAfter(LocalDate scheduledDate, Schedule schedule, LocalDate invocationDate) {
        LocalDate nextDate = scheduledDate;
        while (!nextDate.isAfter(invocationDate)) {
            nextDate = switch (schedule) {
                case WEEKLY -> nextDate.plusWeeks(1);
                case BIWEEKLY -> nextDate.plusWeeks(2);
                case MONTHLY -> nextDate.plusMonths(1);
                case YEARLY -> nextDate.plusYears(1);
            };
        }
        return nextDate;
    }
}
