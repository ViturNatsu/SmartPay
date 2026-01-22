package com.fdmgroup.SmartPay_BackEnd;

import com.fdmgroup.SmartPay_BackEnd.Utility.RateLimiterFilter;
import com.fdmgroup.SmartPay_BackEnd.Utility.RequestCounter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RateLimiterFilterTest {

    private RateLimiterFilter filter;

    @Mock
    private HttpServletRequest servletRequest;

    @Mock
    private HttpServletResponse servletResponse;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() throws IOException {
        filter = new RateLimiterFilter(new RequestCounter());
        when(servletRequest.getRemoteAddr()).thenReturn("192.0.2.100");
    }

    @Test
    void test_WhenRateLimitPass() throws ServletException, IOException {

        filter.doFilter(servletRequest, servletResponse, filterChain);

        verify(filterChain).doFilter(servletRequest, servletResponse);
    }

    @Test
    void test_WhenRateLimitExceeded() throws ServletException, IOException {
        when(servletResponse.getWriter()).thenReturn(new PrintWriter(new StringWriter()));
        filter.doFilter(servletRequest, servletResponse, filterChain);
        filter.doFilter(servletRequest, servletResponse, filterChain);
        filter.doFilter(servletRequest, servletResponse, filterChain);
        filter.doFilter(servletRequest, servletResponse, filterChain);

        verify(servletResponse).setStatus(429);
        verify(filterChain, times(3))
                .doFilter(servletRequest, servletResponse);
    }
}
