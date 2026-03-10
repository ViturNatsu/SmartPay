package com.fdmgroup.SmartPay_BackEnd.config;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.auth.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtSessionService jwtService;
    private final UserService userService;
    private final SessionService sessionService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, io.jsonwebtoken.io.IOException, java.io.IOException {

        // Extract Authorization header
        String authHeader = request.getHeader("Authorization");

        // Check if header exists and starts with "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String token = authHeader.substring(7);

        try {
            // Validate and extract user ID from token (access tokens only)
            if (jwtService.isTokenValid(token) && jwtService.isAccessToken(token)) {
                Long userId = jwtService.getUserIdFromToken(token);

                // Load user details
                User user = userService.getUserById(userId);

                // Check if the user still has an active backend session.
                // After logout or session expiry the session row is deleted,
                // so this rejects reuse of a valid-but-orphaned access token.
                if (!sessionService.hasActiveSession(user)) {
                    logger.debug("No active session for user " + user.getEmail()
                            + " — skipping authentication");
                    filterChain.doFilter(request, response);
                    return;
                }

                // Create authentication object
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Token is invalid - continue without authentication
            logger.error("JWT validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
