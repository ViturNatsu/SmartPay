package com.fdmgroup.SmartPay_BackEnd.controllers.cardrequest;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest.CardRequestResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardrequest.DenyCardRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.services.cardrequest.CardRequestService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/card-request/admin")
public class CardRequestController {

    private final CardRequestService cardRequestService;

    public CardRequestController(CardRequestService cardRequestService) {
        this.cardRequestService = cardRequestService;
    }

    @GetMapping
    @Operation(summary = "Get list of card requests",
            description = "Retrieve all card request records for the request management page.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card requests retrieved successfully")
    })
    public ResponseEntity<List<CardRequestResponseDTO>> getAllRequests() {
        return ResponseEntity.ok(cardRequestService.getAllRequests());
    }

    @GetMapping("/pending")
    @Operation(summary = "Get list of pending card requests",
            description = "Retrieve all pending card request records for admin review.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pending card requests retrieved successfully")
    })
    public ResponseEntity<List<CardRequestResponseDTO>> getPendingRequests() {
        return ResponseEntity.ok(cardRequestService.getPendingRequests());
    }

    @GetMapping("/{requestId}")
    @Operation(
            summary = "Get card request by id",
            description = "Retrieve details for a single card request."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card request retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Card request not found")
    })
    public ResponseEntity<CardRequestResponseDTO> getRequestById(@PathVariable Long requestId) {
        return ResponseEntity.ok(cardRequestService.getRequestById(requestId));
    }

    @PutMapping("/{requestId}/approve")
    @Operation(
            summary = "Approve card request",
            description = "Approve a pending card request and regenerate the user's virtual card details."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card request approved successfully"),
            @ApiResponse(responseCode = "400", description = "Card request cannot be approved"),
            @ApiResponse(responseCode = "404", description = "Card request not found")
    })
    public ResponseEntity<CardRequestResponseDTO> approveRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(cardRequestService.approveRequest(requestId));
    }

    @PutMapping("/{requestId}/deny")
    @Operation(
            summary = "Deny card request",
            description = "Deny a pending card request without regenerating card details."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card request denied successfully"),
            @ApiResponse(responseCode = "400", description = "Card request cannot be denied"),
            @ApiResponse(responseCode = "404", description = "Card request not found")
    })
    public ResponseEntity<CardRequestResponseDTO> denyRequest(
            @PathVariable Long requestId, @RequestBody(required = false) DenyCardRequestDTO denyCardRequestDTO
    ) {
        String denyReason = denyCardRequestDTO == null ? null : denyCardRequestDTO.getDenyReason();
        return ResponseEntity.ok(cardRequestService.denyRequest(requestId, denyReason));
    }
}
