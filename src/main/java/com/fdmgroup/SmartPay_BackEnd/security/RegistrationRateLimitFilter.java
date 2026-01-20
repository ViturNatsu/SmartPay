package com.fdmgroup.SmartPay_BackEnd.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RegistrationRateLimitFilter extends OncePerRequestFilter {

    private final Bucket bucket = Bucket4j.builder()
            .addLimit(Bandwidth.simple(5, Duration.ofMinutes(1)))
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().contains("/api/v1/registration")) {
            if (!bucket.tryConsume(1)) {
                response.setStatus(429);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}

