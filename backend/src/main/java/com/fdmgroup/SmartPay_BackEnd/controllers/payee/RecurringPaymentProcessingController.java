package com.fdmgroup.SmartPay_BackEnd.controllers.payee;

import com.fdmgroup.SmartPay_BackEnd.services.payee.billing.RecurringBillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPaymentProcessResultDTO;
import com.fdmgroup.SmartPay_BackEnd.services.payee.RecurringPaymentProcessor;

import java.time.LocalDate;

@RestController
@RequestMapping("api/v1/internal/recurring-payments")
@RequiredArgsConstructor
public class RecurringPaymentProcessingController {

    private final RecurringPaymentProcessor recurringPaymentProcessor;
    private final RecurringBillingService recurringBillingService;

    @PostMapping("/process")
    public void processDuePayments() {

        recurringBillingService.processDuePaymentsForDate(LocalDate.now());
    }
}
