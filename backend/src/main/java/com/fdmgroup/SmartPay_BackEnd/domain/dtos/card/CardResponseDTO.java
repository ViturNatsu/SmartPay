package com.fdmgroup.SmartPay_BackEnd.domain.dtos.card;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.card.CardStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CardResponseDTO {

    @NotBlank
    @Pattern(regexp = "\\d{16}", message = "Card number must be exactly 16 digits")
    private String virtualCardNumber;

    private LocalDateTime expiryDate;

    @NotBlank
    @Pattern(regexp = "\\d{3}", message = "CVV must be 3 digits")
    private String CVV;

    private CardStatus cardStatus;
}
