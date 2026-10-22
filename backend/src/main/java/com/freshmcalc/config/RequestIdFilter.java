package com.freshmcalc.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Correlation id for logs and support.
 *
 * Every request gets an {@code X-Request-Id} (kept if the caller/CDN supplied
 * one, otherwise generated) which is echoed in the response and put in the MDC,
 * so a user can send us the id from their error screen and we can find the exact
 * stack trace. Runs before security so rejected requests are traceable too.
 *
 * No external dependency: this is enough for log-based alerting, and a Sentry
 * DSN can be layered on later without changing call sites.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Request-Id";
    private static final String MDC_KEY = "requestId";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String incoming = request.getHeader(HEADER);
        String requestId = (incoming != null && !incoming.isBlank() && incoming.length() <= 64)
                ? incoming
                : UUID.randomUUID().toString().substring(0, 8);

        MDC.put(MDC_KEY, requestId);
        response.setHeader(HEADER, requestId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }
}
