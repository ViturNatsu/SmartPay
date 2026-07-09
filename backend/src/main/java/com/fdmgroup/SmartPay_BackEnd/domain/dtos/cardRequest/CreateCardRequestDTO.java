package com.fdmgroup.SmartPay_BackEnd.domain.dtos.cardRequest;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCardRequestDTO {

    @JsonProperty("access-code")
    @NotBlank(message = "Code is required")
    @Pattern(regexp = "^\\d{7}$", message = "Code must be exactly 7 digits")
    private String accessCode;

    @AssertTrue(message = "User must confirm the card replacement policy")
    private boolean confirmed;
}
