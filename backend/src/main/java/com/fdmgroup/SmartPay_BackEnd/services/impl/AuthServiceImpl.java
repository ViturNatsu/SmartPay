package com.fdmgroup.SmartPay_BackEnd.services.impl;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginRequestDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.LoginResponseDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.User;
import com.fdmgroup.SmartPay_BackEnd.security.JwtSessionService;
import com.fdmgroup.SmartPay_BackEnd.services.AuthService;
import com.fdmgroup.SmartPay_BackEnd.services.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtSessionService jwtService;
    private final SessionService sessionService;


    @Override
    public LoginResponseDTO signIn(LoginRequestDTO loginDto) {
        log.info("Login attempt for email: {}", loginDto.getEmail());

        try {
            // This is where authentication happens
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getEmail().trim().toLowerCase(),
                            loginDto.getPassword()
                    )
            );

            log.info("Authentication successful for: {}", loginDto.getEmail());

            User user = (User) authentication.getPrincipal();

            String accessToken = jwtService.createAccessToken(user);
            String refreshToken = jwtService.createRefreshToken(user);

            sessionService.generateNewSession(user, refreshToken);

            log.info("Login successful for user ID: {}", user.getId());
            return new LoginResponseDTO(user.getId(), accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            log.error("Login failed for email: {} - Bad credentials", loginDto.getEmail());
            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception e) {
            log.error("Login failed for email: {} - Error: {}", loginDto.getEmail(), e.getMessage());
            throw e;
        }
    }
}
