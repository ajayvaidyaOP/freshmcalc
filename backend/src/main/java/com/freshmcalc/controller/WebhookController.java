package com.freshmcalc.controller;

import com.freshmcalc.domain.entity.WebhookEvent;
import com.freshmcalc.domain.repository.WebhookEventRepository;
import com.freshmcalc.domain.service.PaymentService;
import com.freshmcalc.exception.BadRequestException;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Razorpay webhooks — reconciliation for payments that finish outside the app
 * (delayed capture, failures, refunds, chargebacks).
 *
 * Rules:
 *  • The signature is verified against the raw body before anything is parsed.
 *  • Events are de-duplicated by id (Razorpay sends the same event more than
 *    once); a duplicate is acknowledged without repeating side effects.
 *  • Server state is the source of truth — this endpoint never trusts the
 *    payload for amounts; it looks the payment up by order id.
 */
@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookEventRepository webhookEventRepository;
    private final PaymentService paymentService;
    private final String webhookSecret;

    public WebhookController(WebhookEventRepository webhookEventRepository,
                             PaymentService paymentService,
                             @Value("${razorpay.webhook-secret:}") String webhookSecret) {
        this.webhookEventRepository = webhookEventRepository;
        this.paymentService = paymentService;
        this.webhookSecret = webhookSecret;
    }

    @PostMapping
    public ResponseEntity<Void> handle(@RequestBody String payload,
                                       @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature,
                                       @RequestHeader(name = "X-Razorpay-Event-Id", required = false) String eventIdHeader) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured — rejecting.");
            throw new BadRequestException("Webhook secret is not configured on the server.");
        }
        if (!verifySignature(payload, signature)) {
            throw new BadRequestException("Invalid webhook signature.");
        }

        JSONObject body;
        try {
            body = new JSONObject(payload);
        } catch (Exception e) {
            throw new BadRequestException("Malformed webhook payload.");
        }

        String eventType = body.optString("event", "unknown");
        String eventId = (eventIdHeader != null && !eventIdHeader.isBlank())
            ? eventIdHeader
            : sha256(payload);

        if (webhookEventRepository.existsByEventId(eventId)) {
            log.debug("Duplicate webhook {} ignored", eventId);
            return ResponseEntity.ok().build();
        }

        switch (eventType) {
            case "payment.captured", "order.paid" -> onPaymentCaptured(body);
            case "payment.failed" -> onPaymentFailed(body);
            case "refund.created", "refund.processed", "payment.refunded" -> onRefund(body);
            default -> log.debug("Unhandled Razorpay event type: {}", eventType);
        }

        WebhookEvent event = new WebhookEvent();
        event.setEventId(eventId);
        event.setEventType(eventType);
        event.setProcessed(true);
        event.setPayload(payload);
        webhookEventRepository.save(event);

        return ResponseEntity.ok().build();
    }

    private void onPaymentCaptured(JSONObject body) {
        JSONObject payment = entity(body, "payment");
        if (payment == null) return;
        String orderId = payment.optString("order_id", null);
        String paymentId = payment.optString("id", null);
        paymentService.reconcilePaid(orderId, paymentId);
    }

    private void onPaymentFailed(JSONObject body) {
        JSONObject payment = entity(body, "payment");
        if (payment == null) return;
        String orderId = payment.optString("order_id", null);
        String reason = "Payment failed at gateway";
        JSONObject error = payment.optJSONObject("error");
        if (error != null) {
            String description = error.optString("description", "");
            String code = error.optString("code", "");
            reason = (description + (code.isBlank() ? "" : " (" + code + ")")).trim();
        }
        paymentService.reconcileFailed(orderId, reason);
    }

    private void onRefund(JSONObject body) {
        JSONObject refund = entity(body, "refund");
        if (refund != null) {
            paymentService.reconcileRefunded(refund.optString("payment_id", null), null);
            return;
        }
        // Some refund events embed the payment entity instead.
        JSONObject payment = entity(body, "payment");
        if (payment != null) {
            paymentService.reconcileRefunded(payment.optString("id", null), payment.optString("order_id", null));
        }
    }

    /** payload.<resource>.entity — null-safe. */
    private JSONObject entity(JSONObject body, String resource) {
        JSONObject payload = body.optJSONObject("payload");
        if (payload == null) return null;
        JSONObject wrapper = payload.optJSONObject(resource);
        return wrapper == null ? null : wrapper.optJSONObject("entity");
    }

    /** HMAC-SHA256 hex digest, verified with the official SDK helper. */
    private boolean verifySignature(String payload, String signature) {
        if (signature == null || signature.isBlank()) return false;
        try {
            return Utils.verifyWebhookSignature(payload, signature, webhookSecret);
        } catch (RazorpayException | RuntimeException e) {
            log.warn("Webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            return Integer.toHexString(value.hashCode());
        }
    }
}
