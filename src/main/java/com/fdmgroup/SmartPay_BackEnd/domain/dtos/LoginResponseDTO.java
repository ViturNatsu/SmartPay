package com.fdmgroup.SmartPay_BackEnd.domain.dtos;

/**
 * US-F02-02-01 (Sign In)
 * DTO for outgoing login responses to the client.
 *
 * Returns:
 * - token (JWT)
 */
public class LoginResponseDTO {

    private final String token;

    public LoginResponseDTO(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}
