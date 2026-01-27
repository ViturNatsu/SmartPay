package com.fdmgroup.SmartPay_BackEnd.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// JWT Authentication Filter
// Runs once per HTTP request and checks for a JWT in the Authorization header
// If the request includes: Authorization: Bearer <token>
// Then we validate the token using JwtService
// If it is valid we mark the request as authenticated inside Spring Security
// by setting an authentication object in the SecurityContext
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // Authenticates an HTTP request using the JWT or does nothing if it fails
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Read Authorization header
        // Expected format: "Bearer <JWT_TOKEN>"
        String header = request.getHeader("Authorization");

        // Do not authenticate if no header or header doesn't start with "Bearer "
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Remove "Bearer " to get the raw JWT
        String token = header.substring(7).trim();

        // Validate the token, do not authenticate if invalid
        if (!jwtService.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the subject (user's email)
        String email = jwtService.extractSubject(token);

        // Create an Authentication object for Spring Security
        // This marks the request as authenticated
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                email,                      // principal (who the user is)
                null,                       // credentials (not needed, JWT is proof)
                Collections.emptyList()     // authorities (roles)
        );

        // Store authentication into SecurityContext so Spring Security treats the request as logged in
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Continue the request to the next filter/controller
        filterChain.doFilter(request, response);
    }
}
