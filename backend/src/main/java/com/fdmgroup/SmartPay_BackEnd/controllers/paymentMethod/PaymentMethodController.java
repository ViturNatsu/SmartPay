package com.fdmgroup.SmartPay_BackEnd.controllers.paymentMethod;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.paymentMethod.PaymentMethodDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentMethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.services.paymentMethods.PaymentMethodService;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.security.core.Authentication;

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
    @Operation(summary = "Add a new PaymentMethod", description = "Add a new payment method for the authenticated user. The account identifier digest is used to link the payment method to an existing account in the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment method created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data or no matching account found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated")
    })
    public ResponseEntity<PaymentMethodDTO> createPaymentRecord(@RequestBody PaymentMethodDTO pmDto,
			Authentication authentication) {

		User principalUser = (User) authentication.getPrincipal();
        pmDto.setUser(principalUser);

        PaymentMethodDTO created = paymentMethodService.addPaymentMethod(pmDto);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(created.getPaymentMethodId()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/user/{id}/{pageNumber}")
    @Operation(summary = "Get PaymentMethods for a User", description = "Get a paginated list of payment methods for a specific user. This endpoint is intended for users to view their own payment methods.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment methods retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user cannot access another user's payment methods"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated")
    })
    public ResponseEntity<Page<PaymentMethodDTO>> getPaymentRecordsOfUser(@PathVariable("id") Long id,
                                                                       @PathVariable("pageNumber") int pageNumber,
																	   Authentication authentication) {
		// Ensure USER is not trying to view another USER's data
        User principalUser = (User) authentication.getPrincipal();
        if (!principalUser.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Page<PaymentMethodDTO> pmDtos = paymentMethodService.findByUserId(id, pageNumber);
        return ResponseEntity.ok(pmDtos);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update a PaymentMethod activeStatus", description = "Update the active status of a payment method. This endpoint is intended for users to deactivate their payment methods.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment method status updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user cannot update another user's payment method")
    })
    public ResponseEntity<PaymentMethodDTO> updatePaymentMethodStatus(
            @PathVariable("id") Long id,
            @RequestBody PaymentMethodDTO pmDto) {

        PaymentMethodDTO updated = paymentMethodService.updatePaymentMethodActiveStatus(id, pmDto.getActive());
        return ResponseEntity.ok(updated);
    }

//  Below endpoints are for admin dashboard
    @GetMapping("/admin")
    @Operation(summary = "Get all PaymentMethods", description = "Get a list of all payment methods. This endpoint is intended for admin use to manage all payment methods across users.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment methods retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user cannot access admin functionality")
    })
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods() {
        return ResponseEntity.ok(paymentMethodService.findAllPaymentMethods());
    }

    @GetMapping("/admin/{id}")
    @Operation(summary = "Get a PaymentMethod by ID", description = "Get a payment method by its ID. This endpoint is intended for admin use to view details of a specific payment method.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment method retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user cannot access admin functionality")
    })
    public ResponseEntity<PaymentMethod> getPaymentMethodById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(paymentMethodService.findPaymentMethodById(id));
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Remove a PaymentMethod by ID", description = "Delete a payment method by ID. This endpoint is intended for admin use to remove a payment method from the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Payment method deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user must be authenticated"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user cannot access admin functionality")
    })
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable("id") Long id) {
        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity.noContent().build();
    }
}
