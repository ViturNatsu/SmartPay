package com.fdmgroup.SmartPay_BackEnd.controllers.payee;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.services.payee.PayeeService;

@RestController
@RequestMapping("api/v1/payee")
public class PayeeController {

    private PayeeService payeeService;

    public PayeeController(PayeeService payeeService) {
        this.payeeService = payeeService;
    }

    @PostMapping
    public ResponseEntity<PayeeResponseDTO> addPayee(@AuthenticationPrincipal User authenticatedUser,
    @RequestBody PayeeRequestDTO payeeRequestDTO) {
    System.out.println("authenticated user ID "+authenticatedUser.getId());
    
   
    PayeeResponseDTO payee = payeeService.addPayee(authenticatedUser.getId(), payeeRequestDTO);
    URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
    .buildAndExpand(payee.getPayeeId()).toUri();
    return ResponseEntity.created(location).body(payee);
    }

    @GetMapping
    public ResponseEntity<List<PayeeResponseDTO>> getUserPayees(@AuthenticationPrincipal User authenticatedUser) {
        
        return ResponseEntity.ok(payeeService.getPayeesForUser(authenticatedUser.getId()));

    }

    @DeleteMapping("/{payeeId}")
    public ResponseEntity<Void> deletePayee(@AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long payeeId) {
        payeeService.deletePayee(authenticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }

}
