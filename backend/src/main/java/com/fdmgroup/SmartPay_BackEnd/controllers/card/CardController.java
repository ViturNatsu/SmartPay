package com.fdmgroup.SmartPay_BackEnd.controllers.card;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.card.CardResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.wallet.WithdrawRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.Card;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import com.fdmgroup.SmartPay_BackEnd.services.card.CardService;
import com.fdmgroup.SmartPay_BackEnd.services.wallet.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/cards")
public class CardController {

    CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping("/{walletId}")
    @Operation(summary = "Get card by wallet ID",
            description = "Retrieve the card associated with a specific wallet ID. "
                    + "A card must exist and must be associated with an existing wallet.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Card retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Wallet with specified ID not found")
    })
    public ResponseEntity<CardResponseDTO> getCardByWalletId(@PathVariable long walletId) {
        CardResponseDTO card = cardService.getCardByWalletId(walletId);
        return ResponseEntity.ok(card);
    }
}