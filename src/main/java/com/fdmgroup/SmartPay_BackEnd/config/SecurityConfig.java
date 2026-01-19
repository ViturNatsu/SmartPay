package com.fdmgroup.SmartPay_BackEnd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{

        http
                .authorizeHttpRequests(auth-> auth
                        .requestMatchers("/h2-console/**", "/api/v*/registration/**", "/api/v*/email/sendemail/**")
                        .permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers("/**"))
                .headers(headers-> headers.frameOptions(frame-> frame.disable())) // needed for h2-console ui to load
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

}
