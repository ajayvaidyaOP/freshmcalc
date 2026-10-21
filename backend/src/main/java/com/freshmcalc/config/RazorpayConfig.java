package com.freshmcalc.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Razorpay client configuration. Operates in test mode unless live credentials are provided.
 * When credentials are missing the application still starts (with a placeholder
 * test client) so rates/calculator features work — payment checkout stays
 * disabled until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured.
 */
@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.test-mode:true}")
    private boolean testMode;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            log.warn("Razorpay credentials are not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). "
                    + "Starting with a placeholder test client — subscription checkout stays disabled until keys are set. "
                    + "See docs/razorpay.md.");
            return new RazorpayClient("rzp_test_unconfigured", "unconfigured");
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
