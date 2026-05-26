//package com.fdmgroup.SmartPay_BackEnd.security;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import javax.crypto.SecretKey;
//import java.nio.charset.StandardCharsets;
//import java.util.Date;
//
//@Service
//public class JwtService {
//    // SecretKey used to sign and verify JWTs. Using HS256 signing
//    private final SecretKey key;
//
//    // JWT expiration length in seconds
//    private final long expirationSeconds;
//
//    // JwtService Constructor
//    // Spring injects jwt.secret and jwt.expirationSeconds from application.properties
//    // Converts the secret string into a SecretKey so JJWT can use it for signing/verification
//    public JwtService(
//            @Value("${jwt.secret}") String secret,
//            @Value("${jwt.expirationSeconds}") long expirationSeconds
//    ) {
//        // HS256 key must be long enough. 32+ chars is safe
//        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
//
//        this.expirationSeconds = expirationSeconds;
//    }
//
//    // Generate a signed JWT for the given subject (in our case: the user's email)
//    // Returns: JWT token string in the format header.payload.signature
//    public String generateToken(String subject) {
//        // get current date/time
//        Date now = new Date();
//
//        // get expiration date/time
//        Date exp = new Date(now.getTime() + expirationSeconds * 1000);
//
//        // create and return the signed JWT
//        return Jwts.builder()
//                .subject(subject)          // "sub"
//                .issuedAt(now)             // "iat"
//                .expiration(exp)           // "exp"
//                .signWith(key)             // signs with HS256 using the secret key
//                .compact();
//    }
//
//    // Extract the subject from a token
//    // Used to identify the user making the request
//    // Returns: the subject ("sub") stored in the JWT
//    public String extractSubject(String token) {
//        return extractAllClaims(token).getSubject();
//    }
//
//    // Validate a JWT by verifying the signature and ensuring the token has not expired
//    // Returns: true if signature is valid and token is not expired, otherwise false
//    public boolean isTokenValid(String token) {
//        try {
//            // this will fail if the signature doesn't match
//            Claims claims = extractAllClaims(token);
//
//            Date exp = claims.getExpiration();
//
//            // return true if not expired, false if expired or null
//            return exp != null && exp.after(new Date());
//
//        } catch (Exception e) {
//            // if the token couldn't be validated for any other reason, return false
//            return false;
//        }
//    }
//
//    // Parses the JWT while also verifying the signature
//    // Returns: Claims payload extracted from the JWT
//    private Claims extractAllClaims(String token) {
//        return Jwts.parser()
//                .verifyWith(key)          // verify signature
//                .build()
//                .parseSignedClaims(token)
//                .getPayload();
//    }
//}