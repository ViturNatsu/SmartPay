package com.fdmgroup.SmartPay_BackEnd.controllers.cardRequest;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest.CreateCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.services.cardRequest.CardRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/card-request/user")
public class UserCardRequestController {
    private final CardRequestService cardRequestService;

    public UserCardRequestController(CardRequestService cardRequestService) {
        this.cardRequestService = cardRequestService;
    }

    @PostMapping("/new-card/otp")
    public ResponseEntity<Void> requestNewCardOtp(
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        User user = (User) authentication.getPrincipal();

        cardRequestService.requestNewCardOtp(user, httpRequest);

        return ResponseEntity.accepted().build();
    }

    @PostMapping("/new-card")
    public ResponseEntity<CardRequestResponseDTO> createNewCardRequest(
            @Valid @RequestBody CreateCardRequestDTO dto,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        User user = (User) authentication.getPrincipal();

        CardRequestResponseDTO response = cardRequestService.createNewCardRequest(
                user,
                dto,
                httpRequest
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}

