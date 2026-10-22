package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Payment;
import com.freshmcalc.domain.entity.PaymentStatus;
import com.freshmcalc.domain.entity.SubscriptionPlan;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.PaymentRepository;
import com.freshmcalc.domain.repository.SubscriptionPlanRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.PaymentDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Razorpay checkout.
 *
 * Security model: the price is always looked up on the server from the plan id,
 * the order is created server-side, and a subscription is activated only after
 * the Razorpay signature is verified. A browser redirect alone never unlocks a
 * paid plan.
 */
@Service
@Transactional
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionService subscriptionService;
    private final RazorpayClient razorpayClient;
    private final String keyId;
    private final String keySecret;

    public PaymentService(PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          SubscriptionPlanRepository planRepository,
                          SubscriptionService subscriptionService,
                          RazorpayClient razorpayClient,
                          @Value("${razorpay.key-id:}") String keyId,
                          @Value("${razorpay.key-secret:}") String keySecret) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.subscriptionService = subscriptionService;
        this.razorpayClient = razorpayClient;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    /** Create a Razorpay order for a plan and store a PENDING payment. */
    public PaymentDto.OrderResponse createOrder(Long userId, Long planId) {
        if (userId == null) {
            throw new BadRequestException("Authentication required.");
        }
        if (planId == null) {
            throw new BadRequestException("A subscription plan is required.");
        }
        if (!isGatewayConfigured()) {
            throw new BadRequestException(
                "Online payments are not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.");
        }

        SubscriptionPlan plan = planRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("Plan not found: " + planId));
        if (!Boolean.TRUE.equals(plan.getActive())) {
            throw new BadRequestException("This plan is not available.");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        BigDecimal price = plan.getPriceAmount();
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This plan has no valid price configured.");
        }
        // Plan prices are stored in paise (49900 = ₹499.00).
        long amountPaise = price.longValue();

        JSONObject notes = new JSONObject();
        notes.put("planId", plan.getId());
        notes.put("userId", user.getId());

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "fm_" + user.getId() + "_" + System.currentTimeMillis());
        orderRequest.put("notes", notes);

        String orderId;
        try {
            Order order = razorpayClient.orders.create(orderRequest);
            orderId = String.valueOf(order.get("id"));
        } catch (RazorpayException | RuntimeException e) {
            log.error("Razorpay order creation failed for plan {}", planId, e);
            throw new BadRequestException("Could not start the payment. Please try again.");
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setRazorpayOrderId(orderId);
        payment.setAmount(price.divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setDescription("PLAN:" + plan.getId());
        paymentRepository.save(payment);

        return new PaymentDto.OrderResponse(orderId, String.valueOf(amountPaise), "INR", keyId, null);
    }

    /**
     * Verify the Razorpay signature and activate the plan that was stored with
     * the order. Idempotent: a repeated callback returns the existing payment.
     */
    public PaymentDto.PaymentResponse verifyAndActivate(Long userId, PaymentDto.VerifyPaymentRequest req) {
        if (userId == null) {
            throw new BadRequestException("Authentication required.");
        }
        if (req == null || isBlank(req.razorpayOrderId()) || isBlank(req.razorpayPaymentId())
                || isBlank(req.razorpaySignature())) {
            throw new BadRequestException("Incomplete payment details.");
        }

        Payment payment = paymentRepository.findAll().stream()
            .filter(p -> req.razorpayOrderId().equals(p.getRazorpayOrderId()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Payment order not found."));

        if (payment.getUser() == null || !userId.equals(payment.getUser().getId())) {
            throw new BadRequestException("This payment does not belong to your account.");
        }
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return toResponse(payment);
        }
        if (!isGatewayConfigured() || isBlank(keySecret)) {
            throw new BadRequestException("Payment gateway is not configured on the server.");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", req.razorpayOrderId());
        options.put("razorpay_payment_id", req.razorpayPaymentId());
        options.put("razorpay_signature", req.razorpaySignature());

        boolean valid;
        try {
            valid = Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            valid = false;
        }
        if (!valid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment signature verification failed");
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed. No subscription was activated.");
        }

        payment.setRazorpayPaymentId(req.razorpayPaymentId());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());
        paymentRepository.save(payment);

        Long planId = planIdFrom(payment.getDescription());
        if (planId != null) {
            subscriptionService.activatePlan(userId, planId);
        } else {
            log.warn("Payment {} has no plan reference; subscription not activated", payment.getId());
        }
        return toResponse(payment);
    }

    public PaymentDto.PaymentResponse toResponse(Payment p) {
        return new PaymentDto.PaymentResponse(
            p.getId(), p.getRazorpayOrderId(), p.getRazorpayPaymentId(), p.getAmount(),
            p.getCurrency(), p.getStatus() != null ? p.getStatus().name() : null, p.getDescription());
    }

    private boolean isGatewayConfigured() {
        return !isBlank(keyId) && !keyId.startsWith("rzp_test_unconfigured");
    }

    private Long planIdFrom(String description) {
        if (description == null || !description.startsWith("PLAN:")) return null;
        try {
            return Long.parseLong(description.substring("PLAN:".length()));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
