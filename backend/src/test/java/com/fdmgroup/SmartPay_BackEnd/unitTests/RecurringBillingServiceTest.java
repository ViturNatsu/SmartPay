package com.fdmgroup.SmartPay_BackEnd.unitTests;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import java.math.BigDecimal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringBillingScheduleUtil;
import com.fdmgroup.SmartPay_BackEnd.Utility.RecurringPaymentType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingCharge;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringBillingStatus;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.RecurringPayee;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.payee.Schedule;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringBillingChargeRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.payee.RecurringPayeeRepository;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.BillingChargeOutcome;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.ChargeExecutionResult;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.PaymentProviderClient;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringBillingServiceImpl;
import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.WalletPaymentProviderClient;

@ExtendWith(MockitoExtension.class)
class RecurringBillingServiceTest {

    @Mock
    private RecurringPayeeRepository recurringPayeeRepository;

    @Mock
    private RecurringBillingChargeRepository chargeRepository;

    @Mock
    private PaymentProviderClient paymentProviderClient;

    @InjectMocks
    private RecurringBillingServiceImpl billingService;

    private RecurringPayee payee;
    private LocalDate cycleDate;

    @BeforeEach
    void setUp() {
        cycleDate = LocalDate.of(2026, 8, 15);

        User owner = User.builder().id(10L).firstName("Test").lastName("User").build();
        User recipient = User.builder().id(20L).firstName("Merchant").lastName("Co").build();

        payee = new RecurringPayee();
        payee.setPayeeId(42L);
        payee.setOwner(owner);
        payee.setRecipient(recipient);
        payee.setPayeeName("Netflix");
        payee.setAmount(new BigDecimal("15.99"));
        payee.setType(RecurringPaymentType.SUBSCRIPTION);
        payee.setSchedule(Schedule.MONTHLY);
        payee.setDate(LocalDate.of(2026, 1, 15));
        payee.setActive(true);
    }

    @Test
    @DisplayName("Scenario 1: due payment is charged once and creates a unique charge record")
    void scenario1_chargesDuePaymentOnce() {
        AtomicReference<String> chargeIdAtFlush = new AtomicReference<>();
        AtomicReference<RecurringBillingStatus> statusAtFlush = new AtomicReference<>();

        when(chargeRepository.findByIdempotencyKey(idempotencyKey())).thenReturn(Optional.empty());
        when(chargeRepository.saveAndFlush(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> {
                    RecurringBillingCharge charge = invocation.getArgument(0);
                    statusAtFlush.set(charge.getStatus());
                    chargeIdAtFlush.set(charge.getChargeId());
                    return charge;
                });
        when(chargeRepository.save(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentProviderClient.executeCharge(any()))
                .thenReturn(new ChargeExecutionResult("provider-ref", "RCP-provider-ref"));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, cycleDate);

        assertEquals(BillingChargeOutcome.CHARGED, outcome);
        assertEquals(RecurringBillingStatus.IN_PROGRESS, statusAtFlush.get());
        assertTrue(isUuid(chargeIdAtFlush.get()));

        InOrder order = inOrder(chargeRepository, paymentProviderClient);
        order.verify(chargeRepository).saveAndFlush(any(RecurringBillingCharge.class));
        order.verify(paymentProviderClient).executeCharge(any());
        order.verify(chargeRepository).save(argThat(charge -> charge.getStatus() == RecurringBillingStatus.COMPLETED));
    }

    @Test
    @DisplayName("Scenario 2: repeat scheduler run skips already completed cycle")
    void scenario2_skipsAlreadyCompletedCycle() {
        RecurringBillingCharge completed = existingCharge(RecurringBillingStatus.COMPLETED, "charge-1");
        when(chargeRepository.findByIdempotencyKey(idempotencyKey())).thenReturn(Optional.of(completed));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, cycleDate);

        assertEquals(BillingChargeOutcome.ALREADY_COMPLETED, outcome);
        verify(paymentProviderClient, never()).executeCharge(any());
        verify(paymentProviderClient, never()).confirmChargeSucceeded(any());
    }

    @Test
    @DisplayName("Scenario 3: concurrent runs result in a single charge")
    void scenario3_preventsDuplicateConcurrentCharge() {
        RecurringBillingCharge winner = existingCharge(RecurringBillingStatus.IN_PROGRESS, "winner-charge");
        winner.setProviderReferenceId("winner-charge");

        when(chargeRepository.findByIdempotencyKey(idempotencyKey()))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(winner));
        when(chargeRepository.saveAndFlush(any(RecurringBillingCharge.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate idempotency key"));
        when(paymentProviderClient.confirmChargeSucceeded("winner-charge")).thenReturn(false);
        when(paymentProviderClient.executeCharge(any()))
                .thenReturn(new ChargeExecutionResult("winner-charge", "RCP-winner-charge"));
        when(chargeRepository.save(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, cycleDate);

        assertEquals(BillingChargeOutcome.CHARGED, outcome);
        verify(paymentProviderClient, times(1)).executeCharge(any());
    }

    @Test
    @DisplayName("Scenario 4: crash after charge confirms with provider and does not re-charge")
    void scenario4_recoversWithoutDoubleChargeAfterCrash() {
        RecurringBillingCharge inProgress = existingCharge(RecurringBillingStatus.IN_PROGRESS, "crash-charge");
        inProgress.setProviderReferenceId("crash-charge");

        when(chargeRepository.findByIdempotencyKey(idempotencyKey())).thenReturn(Optional.of(inProgress));
        when(paymentProviderClient.confirmChargeSucceeded("crash-charge")).thenReturn(true);
        when(chargeRepository.save(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, cycleDate);

        assertEquals(BillingChargeOutcome.RECOVERED_AFTER_CRASH, outcome);
        verify(paymentProviderClient, never()).executeCharge(any());
        verify(chargeRepository).save(argThat(charge ->
                charge.getStatus() == RecurringBillingStatus.COMPLETED
                        && WalletPaymentProviderClient.toTransactionId("crash-charge")
                                .equals(charge.getWalletTransactionId())));
    }

    @Test
    @DisplayName("Scenario 5: failure before charging retries to exactly one successful charge")
    void scenario5_retriesAfterFailureBeforeCharge() {
        RecurringBillingCharge inProgress = existingCharge(RecurringBillingStatus.IN_PROGRESS, "retry-charge");
        inProgress.setProviderReferenceId("retry-charge");

        when(chargeRepository.findByIdempotencyKey(idempotencyKey())).thenReturn(Optional.of(inProgress));
        when(paymentProviderClient.confirmChargeSucceeded("retry-charge")).thenReturn(false);
        when(paymentProviderClient.executeCharge(any()))
                .thenReturn(new ChargeExecutionResult("retry-charge", "RCP-retry-charge"));
        when(chargeRepository.save(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, cycleDate);

        assertEquals(BillingChargeOutcome.CHARGED, outcome);
        verify(paymentProviderClient, times(1)).executeCharge(any());
        verify(chargeRepository).save(argThat(charge -> charge.getStatus() == RecurringBillingStatus.COMPLETED));
    }

    @Test
    @DisplayName("Scenario 6: new billing cycle charges independently of prior cycle")
    void scenario6_chargesNewCycleIndependently() {
        LocalDate previousCycle = LocalDate.of(2026, 7, 13);
        LocalDate nextCycle = LocalDate.of(2026, 8, 13);

        when(chargeRepository.findByIdempotencyKey(
                        RecurringBillingScheduleUtil.buildIdempotencyKey(payee.getPayeeId(), nextCycle)))
                .thenReturn(Optional.empty());
        when(chargeRepository.saveAndFlush(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(chargeRepository.save(any(RecurringBillingCharge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentProviderClient.executeCharge(any()))
                .thenReturn(new ChargeExecutionResult("new-cycle", "RCP-new-cycle"));

        BillingChargeOutcome outcome = billingService.processDuePayment(payee, nextCycle);

        assertEquals(BillingChargeOutcome.CHARGED, outcome);
        verify(chargeRepository).saveAndFlush(argThat(charge ->
                charge.getBillingCycleDate().equals(nextCycle)
                        && !charge.getBillingCycleDate().equals(previousCycle)));
        verify(paymentProviderClient, times(1)).executeCharge(any());
    }

    private RecurringBillingCharge existingCharge(RecurringBillingStatus status, String chargeId) {
        RecurringBillingCharge charge = new RecurringBillingCharge();
        charge.setChargeId(chargeId);
        charge.setIdempotencyKey(idempotencyKey());
        charge.setRecurringPayee(payee);
        charge.setBillingCycleDate(cycleDate);
        charge.setAmount(payee.getAmount().doubleValue());
        charge.setStatus(status);
        charge.setProviderReferenceId(chargeId);
        return charge;
    }

    private String idempotencyKey() {
        return RecurringBillingScheduleUtil.buildIdempotencyKey(payee.getPayeeId(), cycleDate);
    }

    private boolean isUuid(String value) {
        try {
            UUID.fromString(value);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
