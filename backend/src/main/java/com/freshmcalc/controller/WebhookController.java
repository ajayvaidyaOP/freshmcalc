package com.freshmcalc.controller;

import com.freshmcalc.domain.entity.WebhookEvent;
import com.freshmcalc.domain.repository.WebhookEventRepository;
import com.freshmcalc.exception.BadRequestException;
import com.razorpay.RazorpayClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.InvalidKeyException;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
public class WebhookController {

    private final WebhookEventRepository webhookEventRepository;
    private final RazorpayClient razorpayClient;
    private final String webhookSecret;

    public WebhookController(WebhookEventRepository webhookEventRepository,
                             RazorpayClient razorpayClient,
                             @Value("${razorpay.webhook-secret:}") String webhookSecret) {
        this.webhookEventRepository = webhookEventRepository;
        this.razorpayClient = razorpayClient;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping
    public ResponseEntity<Void> handle(@RequestBody String payload,
                                       @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature) {
        // Idempotency: parse event id
        String eventId = extractEventId(payload);
        if (eventId != null && webhookEventRepository.existsByEventId(eventId)) {
            return ResponseEntity.ok().build(); // already processed
        }

        // Verify signature
        if (!verifySignature(payload, signature)) {
            throw new BadRequestException("Invalid webhook signature.");
        }

        // Log event
        if (eventId != null) {
            WebhookEvent event = new WebhookEvent();
            event.setEventId(eventId);
            event.setEventType(extractEventType(payload));
            event.setProcessed(true);
            event.setPayload(payload);
            webhookEventRepository.save(event);
        }

        // Business logic (subscription activation, payment success/failure) handled by PaymentService
        return ResponseEntity.ok().build();
    }

    private String extractEventId(String payload) {
        try {
            int idx = payload.indexOf("\"event\"");
            // naive extraction for structure; production should use JSON parser
            int start = payload.indexOf("\"id\"", idx);
            int s = payload.indexOf('"', start + 6) + 1;
            int e = payload.indexOf('"', s);
            return e > s ? payload.substring(s, e) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String extractEventType(String payload) {
        try {
            int idx = payload.indexOf("\"event\"");
            int s = payload.indexOf('"', idx + 8) + 1;
            int e = payload.indexOf('"', s);
            return e > s ? payload.substring(s, e) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private boolean verifySignature(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank() || signature == null) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = Base64.getEncoder().encodeToString(hash);
            return java.util.Objects.equals(expected, signature);
        } catch (Exception e) {
            return false;
        }
    }
}
