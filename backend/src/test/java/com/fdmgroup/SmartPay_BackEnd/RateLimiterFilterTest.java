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
        when(servletRequest.getRequestURI()).thenReturn("/api/v1/auth/register");
    }

    @Test
    void test_WhenRateLimitPass() throws ServletException, IOException {

        filter.doFilter(servletRequest, servletResponse, filterChain);

        verify(filterChain).doFilter(servletRequest, servletResponse);
    }

    @Test
    void test_WhenRateLimitExceeded() throws ServletException, IOException {
        when(servletResponse.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        int requestAmount = 6;
        for (int i = 0; i < requestAmount; i++) {
            filter.doFilter(servletRequest, servletResponse, filterChain);
        }

        verify(servletResponse).setStatus(429);

        verify(filterChain, times(5))
                .doFilter(servletRequest, servletResponse);
    }

    @Test
    void test_WhenRateLimitExceeded_ForClient1ButNotClient2() throws ServletException, IOException {
        when(servletResponse.getWriter()).thenReturn(new PrintWriter(new StringWriter()));

        // Client 1
        int requestAmount = 6;
        for (int i = 0; i < requestAmount; i++) {
            filter.doFilter(servletRequest, servletResponse, filterChain);
        }

        verify(servletResponse).setStatus(429);

        // Client 2
        when(servletRequest.getRemoteAddr()).thenReturn("192.0.2.124");
        filter.doFilter(servletRequest, servletResponse, filterChain);


        verify(filterChain, times(6))
                .doFilter(servletRequest, servletResponse);
    }
}
