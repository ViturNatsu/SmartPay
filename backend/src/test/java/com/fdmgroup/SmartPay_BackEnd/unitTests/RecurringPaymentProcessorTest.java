//package com.fdmgroup.SmartPay_BackEnd.unitTests;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyDouble;
//import static org.mockito.ArgumentMatchers.anyLong;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.doAnswer;
//import static org.mockito.Mockito.doThrow;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Optional;
//
//import java.math.BigDecimal;
//
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import com.fdmgroup.SmartPay_BackEnd.Utility.TransactionExecutor;
//import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentStatus;
//import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
//import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
//import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
//import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
//import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
//import com.fdmgroup.SmartPay_BackEnd.services.payee.RecurringPaymentProcessorImpl;
//import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
//
//@ExtendWith(MockitoExtension.class)
//class RecurringPaymentProcessorTest {
//
//    @Mock
//    private RecurringPayeeRepository recurringPayeeRepository;
//
//    @Mock
//    private WalletService walletService;
//
//    @Mock
//    private TransactionExecutor transactionExecutor;
//
//    @InjectMocks
//    private RecurringPaymentProcessorImpl processor;
//
//    private final LocalDate invocationDate = LocalDate.of(2026, 8, 12);
//
//    private void runTransactionsImmediately() {
//        doAnswer(invocation -> {
//            invocation.getArgument(0, Runnable.class).run();
//            return null;
//        }).when(transactionExecutor).execute(any(Runnable.class));
//    }
//
//    @Test
//    void chargesDueActivePaymentAndAdvancesItsNextPaymentDate() {
//        runTransactionsImmediately();
//        RecurringPayee payment = duePayment(1L, LocalDate.of(2026, 8, 12));
//        when(recurringPayeeRepository.findDuePaymentIds(invocationDate, RecurringPaymentStatus.ACTIVE))
//                .thenReturn(List.of(1L));
//        when(recurringPayeeRepository.findByPayeeIdForProcessing(1L)).thenReturn(Optional.of(payment));
//
//        int processed = processor.processDuePayments(invocationDate).getProcessedCount();
//
//        assertEquals(1, processed);
//        assertEquals(invocationDate, payment.getLastProcessedDate());
//        assertEquals(LocalDate.of(2026, 9, 12), payment.getDate());
//        verify(walletService).debitRecurringPayment(1L, 25.0, "Internet", invocationDate);
//        verify(recurringPayeeRepository).save(payment);
//    }
//
//    @Test
//    void ignoresPaymentsThatAreNotDue() {
//        when(recurringPayeeRepository.findDuePaymentIds(invocationDate, RecurringPaymentStatus.ACTIVE))
//                .thenReturn(List.of());
//
//        int processed = processor.processDuePayments(invocationDate).getProcessedCount();
//
//        assertEquals(0, processed);
//        verify(walletService, never()).debitRecurringPayment(anyLong(), anyDouble(),
//                any(String.class), any(LocalDate.class));
//    }
//
//    @Test
//    void skipsPaymentThatWasPausedAfterDetection() {
//        runTransactionsImmediately();
//        RecurringPayee payment = duePayment(1L, invocationDate);
//        payment.setActive(false);
//        when(recurringPayeeRepository.findDuePaymentIds(invocationDate, RecurringPaymentStatus.ACTIVE))
//                .thenReturn(List.of(1L));
//        when(recurringPayeeRepository.findByPayeeIdForProcessing(1L)).thenReturn(Optional.of(payment));
//
//        int processed = processor.processDuePayments(invocationDate).getProcessedCount();
//
//        assertEquals(0, processed);
//        verify(walletService, never()).debitRecurringPayment(anyLong(), anyDouble(),
//                any(String.class), any(LocalDate.class));
//        verify(recurringPayeeRepository, never()).save(payment);
//    }
//
//    @Test
//    void skipsCancelledPaymentThatWasDueBeforeCancellation() {
//        runTransactionsImmediately();
//        RecurringPayee payment = duePayment(1L, invocationDate);
//        payment.setStatus(RecurringPaymentStatus.CANCELLED);
//        when(recurringPayeeRepository.findDuePaymentIds(invocationDate, RecurringPaymentStatus.ACTIVE))
//                .thenReturn(List.of(1L));
//        when(recurringPayeeRepository.findByPayeeIdForProcessing(1L)).thenReturn(Optional.of(payment));
//
//        int processed = processor.processDuePayments(invocationDate).getProcessedCount();
//
//        assertEquals(0, processed);
//        verify(walletService, never()).debitRecurringPayment(anyLong(), anyDouble(),
//                any(String.class), any(LocalDate.class));
//        verify(recurringPayeeRepository, never()).save(payment);
//    }
//
//    @Test
//    void continuesWithOtherPaymentsWhenOneChargeFails() {
//        runTransactionsImmediately();
//        RecurringPayee failedPayment = duePayment(1L, invocationDate);
//        RecurringPayee successfulPayment = duePayment(2L, invocationDate);
//        successfulPayment.setPayeeName("Phone");
//        when(recurringPayeeRepository.findDuePaymentIds(invocationDate, RecurringPaymentStatus.ACTIVE))
//                .thenReturn(List.of(1L, 2L));
//        when(recurringPayeeRepository.findByPayeeIdForProcessing(1L)).thenReturn(Optional.of(failedPayment));
//        when(recurringPayeeRepository.findByPayeeIdForProcessing(2L)).thenReturn(Optional.of(successfulPayment));
//        doThrow(new InsufficientFundsException("Insufficient wallet balance"))
//                .when(walletService).debitRecurringPayment(eq(1L), eq(25.0), eq("Internet"), eq(invocationDate));
//
//        int processed = processor.processDuePayments(invocationDate).getProcessedCount();
//
//        assertEquals(1, processed);
//        assertEquals(null, failedPayment.getLastProcessedDate());
//        assertEquals(invocationDate, successfulPayment.getLastProcessedDate());
//        verify(recurringPayeeRepository).save(successfulPayment);
//        verify(recurringPayeeRepository, never()).save(failedPayment);
//    }
//
//    private RecurringPayee duePayment(Long id, LocalDate date) {
//        User owner = User.builder().id(1L).build();
//        RecurringPayee payment = new RecurringPayee();
//        payment.setPayeeId(id);
//        payment.setOwner(owner);
//        payment.setPayeeName("Internet");
//        payment.setAmount(new BigDecimal("25.00"));
//        payment.setSchedule(Schedule.MONTHLY);
//        payment.setDate(date);
//        payment.setActive(true);
//        payment.setStatus(RecurringPaymentStatus.ACTIVE);
//        return payment;
//    }
//}
