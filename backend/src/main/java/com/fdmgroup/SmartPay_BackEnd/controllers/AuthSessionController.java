package com.fdmgroup.SmartPay_BackEnd.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fdmgroup.SmartPay_BackEnd.Utility.EventType;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.KeepAliveDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.exception.SessionAuthenticationException;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.OtpService;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import com.fdmgroup.SmartPay_BackEnd.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthSessionController {

    private final UserService userService;
    private final JwtSessionService jwtService;
    private final SessionService sessionService;
    private final OtpService otpService;

    // Step 1 of login flow: validate credentials and send OTP.
    @PostMapping({ "/login" })
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequestDTO request,
            HttpServletRequest httpRequest) {
        String email = request.getEmail() == null ? null : request.getEmail().trim().toLowerCase();

        final User user;
        try {
            // Validate credentials (throws if invalid)
            user = userService.validateCredentials(email, request.getPassword());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        if (!user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message",
                            "Your email address is not verified. Please check your inbox and verify your email to continue."));
        }

        otpService.requestOtp(email, EventType.LOGIN, httpRequest);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("otpSent", true));
    }

    /**
     * Keep-alive endpoint (Heartbeat from Frontend)
     * Updates session AND returns a fresh access token if the current one is close
     * to expiring
     */
    // @PostMapping("/keep-alive")
    // public ResponseEntity<KeepAliveDTO> keepAlive(
    // @RequestHeader("Authorization") String authHeader) {
    // try {
    // String refreshToken = authHeader.replace("Bearer ", "");

    // if (!jwtService.isTokenValid(refreshToken) ||
    // !jwtService.isRefreshToken(refreshToken)) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    // }

    // // Validate and update session
    // sessionService.keepSessionAlive(refreshToken);

    // // Extract user from refresh token
    // Long userId = jwtService.getUserIdFromToken(refreshToken);
    // User user = userService.getUserById(userId);

    // // Generate a fresh access token
    // String newAccessToken = jwtService.createAccessToken(user);

    // KeepAliveDTO response = new KeepAliveDTO();
    // response.setAccessToken(newAccessToken);
    // response.setRefreshToken(refreshToken);

    // return ResponseEntity.ok(response);
    // } catch (SessionAuthenticationException e) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    // }
    // }

    // Refresh (rotate) refresh token and issue a new access token.
    @PostMapping("/refresh")
    public ResponseEntity<KeepAliveDTO> refresh(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Guard: no header → no refresh
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String oldRefreshToken = authHeader.substring(7).trim();

            if (oldRefreshToken.isBlank()
                    || !jwtService.isTokenValid(oldRefreshToken)
                    || !jwtService.isRefreshToken(oldRefreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            sessionService.validateSession(oldRefreshToken);

            Long userId = jwtService.getUserIdFromToken(oldRefreshToken);
            User user = userService.getUserById(userId);

            String newAccessToken = jwtService.createAccessToken(user);
            String newRefreshToken = jwtService.createRefreshToken(user);
            sessionService.rotateRefreshToken(oldRefreshToken, newRefreshToken);

            KeepAliveDTO dto = new KeepAliveDTO();
            dto.setAccessToken(newAccessToken);
            dto.setRefreshToken(newRefreshToken);
            return ResponseEntity.ok(dto);

        } catch (SessionAuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String refreshToken = authHeader.substring(7).trim();
            if (!refreshToken.isBlank()) {
                sessionService.revokeSession(refreshToken);
            }
        }
        return ResponseEntity.noContent().build();
    }
}
