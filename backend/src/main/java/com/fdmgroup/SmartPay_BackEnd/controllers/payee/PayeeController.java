package com.fdmgroup.SmartPay_BackEnd.controllers.payee;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.AddPayeeRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.payee.PayeeDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.services.payee.PayeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("api/v1/payees")
public class PayeeController {

    private final PayeeService payeeService;

    public PayeeController(PayeeService payeeService) {
        this.payeeService = payeeService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PayeeDTO>> getPayees(
            @PathVariable Long userId,
            Authentication authentication) {

        User principal = (User) authentication.getPrincipal();
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        return ResponseEntity.ok(payeeService.getPayeesByOwnerId(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<PayeeDTO> addPayee(
            @PathVariable Long userId,
            @Valid @RequestBody AddPayeeRequestDTO request,
            Authentication authentication) {

        User principal = (User) authentication.getPrincipal();
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }

        PayeeDTO created = payeeService.addPayee(userId, request.recipientEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
