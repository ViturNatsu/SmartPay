package com.fdmgroup.SmartPay_BackEnd.domain.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * US-F02-02-01 (Sign In)
 * DTO for outgoing login responses to the client.
 *
 * Returns:
 * - token (JWT)
 */
@Data
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;
    private Long id;
    private String accessToken;
    private String refreshToken;

    public LoginResponseDTO(String token) {
        this.token = token;
    }

    public LoginResponseDTO(Long id, String  accessToken, String refreshToken){
        this.id = id;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
