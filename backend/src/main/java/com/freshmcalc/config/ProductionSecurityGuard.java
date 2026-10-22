package com.freshmcalc.config;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Fail fast instead of running the production profile with public dev defaults. */
@Component
@Profile("prod")
public class ProductionSecurityGuard {

    private static final String DEV_JWT = "change-me-in-production-this-must-be-at-least-256-bits-long";

    public ProductionSecurityGuard(
            @Value("${jwt.secret:}") String jwtSecret,
            @Value("${spring.datasource.password:}") String databasePassword,
            @Value("${app.admin.password:}") String adminPassword,
            @Value("${razorpay.test-mode:false}") boolean razorpayTestMode,
            @Value("${razorpay.key-id:}") String razorpayKeyId) {
        if (jwtSecret == null || jwtSecret.isBlank() || DEV_JWT.equals(jwtSecret) || keyBytes(jwtSecret) < 32) {
            throw new IllegalStateException("Production requires a random JWT_SECRET with at least 256 bits of key material.");
        }
        if (databasePassword == null || databasePassword.isBlank() || "freshmcalc".equals(databasePassword)) {
            throw new IllegalStateException("Production requires a strong, non-default DB_PASSWORD.");
        }
        if ("Admin@123".equals(adminPassword)) {
            throw new IllegalStateException("The development ADMIN_PASSWORD must not be used in production.");
        }
        if (!razorpayTestMode && razorpayKeyId != null && razorpayKeyId.startsWith("rzp_test_")) {
            throw new IllegalStateException("RAZORPAY_TEST_MODE=false cannot be combined with Razorpay test keys.");
        }
    }

    private static int keyBytes(String secret) {
        String value = secret.trim();
        try {
            return Base64.getDecoder().decode(value).length;
        } catch (IllegalArgumentException ignored) {
            // Try Base64URL before treating the value as a plain-text passphrase.
        }
        try {
            return Base64.getUrlDecoder().decode(value).length;
        } catch (IllegalArgumentException ignored) {
            return value.getBytes(StandardCharsets.UTF_8).length;
        }
    }
}
