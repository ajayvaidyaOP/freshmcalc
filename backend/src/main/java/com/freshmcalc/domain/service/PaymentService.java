package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Payment;
import com.freshmcalc.domain.entity.PaymentStatus;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.repository.PaymentRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.PaymentDto;
import com.freshmcalc.exception.ResourceNotFoundException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Payment recording. Subscriptions activate only after verified Razorpay payment/webhook.
 */
@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    public Payment recordPayment(Long userId, String razorpayOrderId, String razorpayPaymentId,
                                 BigDecimal amount, String currency, String description) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setDescription(description);
        payment.setPaidAt(Instant.now());
        return paymentRepository.save(payment);
    }

    public Optional<Payment> markFailed(String razorpayOrderId, String reason) {
        return paymentRepository.findAll().stream()
            .filter(p -> razorpayOrderId.equals(p.getRazorpayOrderId())
                && p.getStatus() == PaymentStatus.PENDING)
            .findFirst()
            .map(p -> {
                p.setStatus(PaymentStatus.FAILED);
                p.setFailureReason(reason);
                return paymentRepository.save(p);
            });
    }

    public PaymentDto.PaymentResponse toResponse(Payment p) {
        return new PaymentDto.PaymentResponse(
            p.getId(), p.getRazorpayOrderId(), p.getRazorpayPaymentId(), p.getAmount(),
            p.getCurrency(), p.getStatus() != null ? p.getStatus().name() : null, p.getDescription());
    }
}
