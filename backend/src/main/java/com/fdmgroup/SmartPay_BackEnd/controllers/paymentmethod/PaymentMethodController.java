package com.fdmgroup.SmartPay_BackEnd.controllers.paymentmethod;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.services.paymentmethods.PaymentMethodService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("api/v1/paymentmethods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @PostMapping
    public ResponseEntity<PaymentMethod> createPaymentRecord(@RequestBody PaymentMethod pm) {
        PaymentMethod created = paymentMethodService.addPaymentMethod(pm);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.getPayment_method_id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/user/{id}/{pageNumber}")
    public ResponseEntity<Page<PaymentMethod>> getPaymentRecordsOfUser(@PathVariable("id") Long id,
                                                                       @PathVariable("pageNumber") int pageNumber) {
        Page<PaymentMethod> pms = paymentMethodService.findByUserId(id, pageNumber);
        return ResponseEntity.ok(pms);
    }
}
