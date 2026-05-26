package com.fdmgroup.SmartPay_BackEnd.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.fdmgroup.SmartPay_BackEnd.services.user.UserService;

import lombok.AllArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Configuration
@AllArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final UserService userService;
        private final PasswordEncoder passwordEncoder;

        private static final String[] PUBLIC_API_ENDPOINTS = {
                        "/api/v*/password-reset/**",
                        "/api/v*/auth/**",
                        "/api/v*/otp/**",
                        "/actuator/**",
                        "/error/**"
        };

        private static final String[] DEV_ONLY = {
                        "/h2-console/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**"
        };

        /**
         * IMPORTANT: Configure authentication provider to use our UserService
         */
        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userService);
                provider.setPasswordEncoder(passwordEncoder);
                return provider;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true);
                config.addAllowedOriginPattern("*");
                config.addAllowedHeader("*");
                config.addAllowedMethod("*");

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .exceptionHandling(exception -> exception
                                        // 401 Unauthorized
                                        .authenticationEntryPoint((request, response, authException) -> {
                                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                            response.setContentType("application/json");
                                            response.getWriter().write("{\"status\":\"401\",\"error\":\"UNAUTHORIZED\",\"message\":\"Missing Or Invalid Token.\"}");
                                        })
                                        // 403 Forbidden
                                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                            response.setContentType("application/json");
                                            response.getWriter().write("{\"status\":\"403\",\"error\":\"FORBIDDEN\",\"message\":\"You do not have permission to access this resource.\"}");
                                        })
                                )
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(HttpMethod.PUT, "/api/v*/password-reset/**")
                                                .permitAll()
                                                .requestMatchers(PUBLIC_API_ENDPOINTS).permitAll()
                                                .requestMatchers(DEV_ONLY).permitAll()
                                                .requestMatchers("/api/v*/accounts/admin/**", "/api/v*/admin/**", "/api/v*/paymentmethods/admin/**").hasRole("ADMIN")
                                                .anyRequest().authenticated())
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
