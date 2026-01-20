package com.fdmgroup.SmartPay_BackEnd.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class RegistrationRateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> ipBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> emailBuckets = new ConcurrentHashMap<>();

    @Value("${rate.limit.registration.max-requests}")
    private int MAX_REQUESTS;

    @Value("${rate.limit.registration.duration-seconds}")
    private long DURATION;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/v1/registration")
                || !"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest =
                new ContentCachingRequestWrapper(request, 1024 * 10); // 10KB cache

        String ip = getClientIP(wrappedRequest);
        String email = extractEmail(wrappedRequest);

        Bucket ipBucket = ipBuckets.computeIfAbsent(ip, k -> newBucket());
        if (!ipBucket.tryConsume(1)) {
            sendTooManyRequests(response);
            return;
        }

        if (email != null && !email.isBlank()) {
            Bucket emailBucket = emailBuckets.computeIfAbsent(email, k -> newBucket());
            if (!emailBucket.tryConsume(1)) {
                sendTooManyRequests(response);
                return;
            }
        }

        filterChain.doFilter(wrappedRequest, response);
    }

    private Bucket newBucket() {
        return Bucket4j.builder()
                .addLimit(Bandwidth.classic(
                        MAX_REQUESTS,
                        Refill.intervally(MAX_REQUESTS, Duration.ofSeconds(DURATION))
                ))
                .build();
    }

    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("""
            {
              "message": "Too many registration attempts. Please wait a minute and try again."
            }
        """);
    }

    private String extractEmail(ContentCachingRequestWrapper request) {
        try {
            String body = new String(request.getContentAsByteArray(), StandardCharsets.UTF_8);

            if (body.isBlank()) return null;

            JsonNode node = objectMapper.readTree(body);
            return node.has("email")
                    ? node.get("email").asText().trim().toLowerCase()
                    : null;

        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}

