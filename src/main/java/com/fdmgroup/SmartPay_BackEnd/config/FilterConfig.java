package com.fdmgroup.SmartPay_BackEnd.config;

import com.fdmgroup.SmartPay_BackEnd.Utility.RateLimiterFilter;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class FilterConfig {

    @Bean
    public FilterRegistrationBean<RateLimiterFilter> rateLimiterFilterBean(RequestCounter requestCounter) {
        FilterRegistrationBean<RateLimiterFilter> filterRegistrationBean = new FilterRegistrationBean<>();
        filterRegistrationBean.setFilter(new RateLimiterFilter(requestCounter));

        // Add api paths that require a rate-limiter here
        filterRegistrationBean.addUrlPatterns("/api/v*/registration");
        filterRegistrationBean.setOrder(1);
        return filterRegistrationBean;
    }
}
