package com.freshmcalc.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay client configuration. Operates in test mode unless live credentials are provided.
 */
@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.test-mode:true}")
    private boolean testMode;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new RazorpayException("Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
        return new RazorpayClient(keyId, keySecret);
    }

    public boolean isTestMode() {
        return testMode;
    }

    public String getKeyId() {
        return keyId;
    }
}
