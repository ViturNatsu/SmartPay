package com.fdmgroup.SmartPay_BackEnd.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtSessionService {
    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.access.token.expiration}")
    private Long ACCESS_TOKEN_EXPIRATION;

    @Value("${jwt.refresh.token.expiration}")
    private Long REFRESH_TOKEN_EXPIRATION;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Creates an access token (short-lived, for API requests)
     */
    public String createAccessToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("typ", "access")
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Creates a refresh token (longer-lived, for getting new access tokens)
     */
    public String createRefreshToken(User user) {
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("typ", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts user ID from token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public String getTokenType(String token) {
        Claims claims = parseClaims(token);
        Object typ = claims.get("typ");
        return typ == null ? null : typ.toString();
    }

    public boolean isAccessToken(String token) {
        return "access".equals(getTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(getTokenType(token));
    }

    /**
     * Validates if the token is properly signed and not expired
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
