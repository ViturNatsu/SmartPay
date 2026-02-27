package com.fdmgroup.SmartPay_BackEnd.Utility;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

@AllArgsConstructor
@Component
@Profile("!test")
public class RateLimiterFilter implements Filter {

    private static final Logger LOGGER = Logger.getLogger(RateLimiterFilter.class.getName());
    private final RequestCounter requestCounter;

    @Override
    @Order(1)
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpResponse = (HttpServletResponse) servletResponse;

        String clientIp = httpRequest.getRemoteAddr();

        if (httpRequest.getRequestURI().startsWith("/api/v1/auth/register") && !requestCounter.requestAllowed(clientIp)) {
            httpResponse.setStatus(429);
            httpResponse.getWriter().write("Too many requests.");
            LOGGER.log(Level.WARNING, "Request Blocked: Too many requests.");
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
