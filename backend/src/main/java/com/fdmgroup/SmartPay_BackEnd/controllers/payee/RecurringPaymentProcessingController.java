package com.fdmgroup.SmartPay_BackEnd.controllers.payee;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPaymentProcessResultDTO;
import com.fdmgroup.SmartPay_BackEnd.services.payee.RecurringPaymentProcessor;

@RestController
@RequestMapping("api/v1/internal/recurring-payments")
public class RecurringPaymentProcessingController {

    private final RecurringPaymentProcessor recurringPaymentProcessor;

    public RecurringPaymentProcessingController(RecurringPaymentProcessor recurringPaymentProcessor) {
        this.recurringPaymentProcessor = recurringPaymentProcessor;
    }

    @PostMapping("/process")
    public ResponseEntity<RecurringPaymentProcessResultDTO> processDuePayments() {
        return ResponseEntity.ok(recurringPaymentProcessor.processDuePayments());
    }
}
