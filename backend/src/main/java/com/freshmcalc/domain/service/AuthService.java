package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Calculation;
import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.domain.repository.CalculationRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import com.freshmcalc.util.JwtUtil;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication, profile and account-lifecycle service.
 *
 * Security notes:
 *  • Password reset tokens are random 256-bit values; only a SHA-256 hash is
 *    stored, so a database leak cannot be used to reset accounts.
 *  • Forgot-password never reveals whether an email is registered.
 *  • Account deletion anonymises the user (email + password + profile), keeps
 *    payment records for accounting, and removes the user's cost sheets.
 */
@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /** Reset links live for 30 minutes. */
    private static final long RESET_TOKEN_TTL_SECONDS = 30L * 60;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SubscriptionService subscriptionService;
    private final CalculationRepository calculationRepository;
    private final MailService mailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       SubscriptionService subscriptionService,
                       CalculationRepository calculationRepository,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.subscriptionService = subscriptionService;
        this.calculationRepository = calculationRepository;
        this.mailService = mailService;
    }

    /* ------------------------------------------------------------- accounts */

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("This email is already registered. Please sign in instead.");
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(trimToNull(req.firstName()));
        user.setLastName(trimToNull(req.lastName()));
        user.setPhone(trimToNull(req.phone()));
        user.setCompany(trimToNull(req.company()));
        user.setCountry(trimToNull(req.country()));
        user.setCity(trimToNull(req.city()));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getRole().name(), user.getStatus());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.email().trim().toLowerCase())
            .orElseThrow(() -> new BadRequestException("Invalid email or password."));
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("This account is not active. Contact support@freshmcalc.com.");
        }
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getRole().name(), user.getStatus());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    /** Profile + live entitlements for the signed-in user. */
    public AuthDto.MeResponse me(String email) {
        return toMe(getCurrentUser(email));
    }

    /** Persist profile changes made in Account Settings. */
    public AuthDto.MeResponse updateProfile(String email, AuthDto.ProfileUpdateRequest req) {
        User user = getCurrentUser(email);
        if (req.firstName() != null && req.firstName().isBlank()) {
            throw new BadRequestException("First name cannot be empty.");
        }
        if (req.firstName() != null) user.setFirstName(trimToNull(req.firstName()));
        if (req.lastName() != null) user.setLastName(trimToNull(req.lastName()));
        if (req.phone() != null) user.setPhone(trimToNull(req.phone()));
        if (req.company() != null) user.setCompany(trimToNull(req.company()));
        if (req.country() != null) user.setCountry(trimToNull(req.country()));
        if (req.city() != null) user.setCity(trimToNull(req.city()));
        userRepository.save(user);
        return toMe(user);
    }

    /**
     * Delete the signed-in account.
     * Anonymises personal data, cancels the plan and removes saved cost sheets.
     * Payment rows stay for accounting but are no longer attributable to a person.
     */
    public void deleteAccount(String email) {
        User user = getCurrentUser(email);
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException(
                "Administrator accounts cannot be deleted from the app. Change ADMIN_EMAIL on the server first.");
        }

        subscriptionService.cancelActive(user.getId());

        List<Calculation> calculations = calculationRepository.findByUserId(user.getId());
        if (!calculations.isEmpty()) {
            calculationRepository.deleteAll(calculations);
        }

        String anonymised = "deleted-" + user.getId() + "@freshmcalc.invalid";
        user.setEmail(anonymised);
        // Random password so the old one can never be used again.
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFirstName("Deleted");
        user.setLastName(null);
        user.setPhone(null);
        user.setCompany(null);
        user.setCountry(null);
        user.setCity(null);
        user.setStatus("DELETED");
        user.setEmailVerified(false);
        user.setEmailVerificationToken(null);
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        // NOTE: we deliberately do NOT set deletedAt. User has @Where(deleted_at
        // IS NULL), so hiding the row would make the payment history (needed for
        // GST/accounting) un-joinable and could throw EntityNotFound from a
        // refund webhook. Anonymising + status DELETED is the deletion: no
        // personal data remains, and login is refused by the status check.
        userRepository.save(user);
        log.info("Account deleted and anonymised (user id {})", user.getId());
    }

    /* --------------------------------------------------------- password reset */

    /**
     * Always behaves the same whether or not the email exists, so attackers
     * cannot use this endpoint to discover registered accounts.
     */
    public void requestPasswordReset(String email) {
        String normalised = email == null ? "" : email.trim().toLowerCase();
        userRepository.findByEmail(normalised)
            .filter(user -> "ACTIVE".equals(user.getStatus()))
            .ifPresent(user -> {
                String token = generateToken();
                user.setPasswordResetToken(sha256(token));
                user.setPasswordResetExpiry(Instant.now().plusSeconds(RESET_TOKEN_TTL_SECONDS));
                userRepository.save(user);
                mailService.sendPasswordReset(user.getEmail(), token);
            });
    }

    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("This reset link is invalid. Please request a new one.");
        }
        User user = userRepository.findByPasswordResetToken(sha256(token))
            .orElseThrow(() -> new BadRequestException(
                "This reset link is invalid or has already been used. Please request a new one."));
        if (user.getPasswordResetExpiry() == null || user.getPasswordResetExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("This reset link has expired. Please request a new one.");
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("This account is not active. Contact support@freshmcalc.com.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepository.save(user);
        log.info("Password reset completed for user id {}", user.getId());
    }

    /* ----------------------------------------------------------------- utils */

    private AuthDto.MeResponse toMe(User user) {
        return new AuthDto.MeResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhone(),
            user.getCompany(),
            user.getCountry(),
            user.getCity(),
            user.getRole() != null ? user.getRole().name() : null,
            user.getStatus(),
            subscriptionService.getEntitlements(user.getId()),
            subscriptionService.getActiveSubscriptionOrNull(user.getId())
        );
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
