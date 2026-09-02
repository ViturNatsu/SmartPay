package com.fdmgroup.SmartPay_BackEnd.controllers.payee;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.RecurringPayeeResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.ResumeRecurringPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.services.payee.PayeeService;
import com.fdmgroup.SmartPay_BackEnd.services.payee.RecurringPayeeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/payee")
public class PayeeController {

    private final PayeeService payeeService;
    private final RecurringPayeeService recurringPayeeService;

    public PayeeController(PayeeService payeeService, RecurringPayeeService recurringPayeeService) {
        this.payeeService = payeeService;
        this.recurringPayeeService = recurringPayeeService;
    }

    @PostMapping
    public ResponseEntity<PayeeResponseDTO> addPayee(
            @AuthenticationPrincipal User authenticatedUser,
            @RequestBody PayeeRequestDTO payeeRequestDTO) {

        PayeeResponseDTO payee = payeeService.addPayee(authenticatedUser.getId(), payeeRequestDTO);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(payee.getPayeeId())
                .toUri();
        return ResponseEntity.created(location).body(payee);
    }

    @PostMapping("/recurring")
    public ResponseEntity<RecurringPayeeResponseDTO> addRecurringPayee(
            @AuthenticationPrincipal User authenticatedUser,
            @Valid @RequestBody RecurringPayeeRequestDTO payeeRequestDTO) {

        RecurringPayeeResponseDTO payee = recurringPayeeService.addRecurringPayee(authenticatedUser.getId(), payeeRequestDTO);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(payee.getPayeeId())
                .toUri();
        return ResponseEntity.created(location).body(payee);
    }

    @GetMapping
    public ResponseEntity<List<PayeeResponseDTO>> getUserPayees(
            @AuthenticationPrincipal User authenticatedUser) {

        return ResponseEntity.ok(payeeService.getPayeesForUser(authenticatedUser.getId()));
    }

    @GetMapping("/recurring")
    public ResponseEntity<List<RecurringPayeeResponseDTO>> getUserRecurringPayees(
            @AuthenticationPrincipal User authenticatedUser) {

        return ResponseEntity.ok(recurringPayeeService.getRecurringPayeesForUser(authenticatedUser.getId()));
    }

    @GetMapping("/recurring/{payeeId}")
    public ResponseEntity<RecurringPayeeResponseDTO> getUserRecurringPayeeDetails(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long payeeId) {

        return ResponseEntity.ok(recurringPayeeService.getRecurringPayeeDetails(authenticatedUser.getId(), payeeId));
    }
    
    @DeleteMapping("/{payeeId}")
    public ResponseEntity<Void> deletePayee(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long payeeId) {

        payeeService.deletePayee(authenticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/recurring/{payeeId}")
    public ResponseEntity<Void> deleteRecurringPayee(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long payeeId) {

        recurringPayeeService.deleteRecurringPayee(authenticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/recurring/{payeeId}")
    public ResponseEntity<RecurringPayeeResponseDTO> updateRecurringPayee(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable Long payeeId,
        @Valid @RequestBody RecurringPayeeRequestDTO payeeRequestDTO){
        return ResponseEntity.ok(recurringPayeeService.updateRecurringPayee(authenticatedUser.getId(), payeeId, payeeRequestDTO));
    }

    @PutMapping("/recurring/cancel/{payeeId}")
    public ResponseEntity<Void> cancelRecurringPayee(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable Long payeeId){
        recurringPayeeService.cancelRecurringPayee(authenticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/recurring/reactivate/{payeeId}")
    public ResponseEntity<Void> reactivateRecurringPayee(
        @AuthenticationPrincipal User authenticatedUser,
        @PathVariable Long payeeId){
        recurringPayeeService.reactivateRecurringPayee(authenticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/recurring/pause/{payeeId}")
    public ResponseEntity<Void> pauseRecurringPayee(@AuthenticationPrincipal User autehnticatedUser, @PathVariable Long payeeId){
        recurringPayeeService.pauseRecurringPayee(autehnticatedUser.getId(), payeeId);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/recurring/resume/{payeeId}")
    public ResponseEntity<Void> resumeRecurringPayee(
            @AuthenticationPrincipal User authenticatedUser,
            @PathVariable Long payeeId,
            @RequestBody(required = false) ResumeRecurringPayeeRequestDTO resumeRequestDTO) {
        recurringPayeeService.resumeRecurringPayee(authenticatedUser.getId(), payeeId, resumeRequestDTO);
        return ResponseEntity.noContent().build();
    }
}
