package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.exception.BadRequestException;
import com.freshmcalc.exception.ResourceNotFoundException;
import com.freshmcalc.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication and registration service.
 */
@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SubscriptionService subscriptionService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       SubscriptionService subscriptionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.subscriptionService = subscriptionService;
    }

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BadRequestException("Email already registered: " + req.email());
        }
        User user = new User();
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setPhone(req.phone());
        user.setCompany(req.company());
        user.setCountry(req.country());
        user.setCity(req.city());
        user.setRole(UserRole.CUSTOMER);
        user.setStatus("ACTIVE");
        user.setEmailVerified(false);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getRole().name(), user.getStatus());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new BadRequestException("Invalid email or password."));
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new BadRequestException("Account is not active. Status: " + user.getStatus());
        }
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password.");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getRole().name(), user.getStatus());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    /** Profile + live entitlements for the signed-in user. */
    public AuthDto.MeResponse me(String email) {
        User user = getCurrentUser(email);
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
}
