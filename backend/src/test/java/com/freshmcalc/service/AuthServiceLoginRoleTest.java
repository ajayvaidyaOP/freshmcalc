package com.freshmcalc.service;

import com.freshmcalc.domain.entity.User;
import com.freshmcalc.domain.entity.UserRole;
import com.freshmcalc.domain.repository.CalculationRepository;
import com.freshmcalc.domain.repository.UserRepository;
import com.freshmcalc.domain.service.AuthService;
import com.freshmcalc.domain.service.MailService;
import com.freshmcalc.domain.service.SubscriptionService;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

/**
 * Regression tests for "admin login lands on the trader dashboard".
 *
 * The login response must carry the role stored in the database so the
 * frontend can route ADMIN accounts to /admin and CUSTOMER accounts to
 * /dashboard. The role must never be derived from the email address.
 */
class AuthServiceLoginRoleTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private SubscriptionService subscriptionService;
    @Mock private CalculationRepository calculationRepository;
    @Mock private MailService mailService;

    @InjectMocks private AuthService service;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    private void stubLogin(String email, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash("stored-hash");
        user.setRole(role);
        user.setStatus("ACTIVE");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret1", "stored-hash")).thenReturn(true);
        when(jwtUtil.generateToken(email, role.name())).thenReturn("jwt-token");
    }

    @Test
    void adminLoginReturnsAdminRole() {
        stubLogin("admin@freshmcalc.com", UserRole.ADMIN);

        AuthDto.AuthResponse res = service.login(new AuthDto.LoginRequest("admin@freshmcalc.com", "secret1"));

        assertEquals("ADMIN", res.role());
        assertEquals("admin@freshmcalc.com", res.email());
        assertEquals("jwt-token", res.token());
    }

    @Test
    void traderLoginReturnsCustomerRole() {
        stubLogin("trader@example.com", UserRole.CUSTOMER);

        AuthDto.AuthResponse res = service.login(new AuthDto.LoginRequest("trader@example.com", "secret1"));

        assertEquals("CUSTOMER", res.role());
    }

    @Test
    void adminLookingEmailWithCustomerRoleStaysCustomer() {
        // Role comes from the database record, never from the email text.
        stubLogin("admin@freshmcalc.com", UserRole.CUSTOMER);

        AuthDto.AuthResponse res = service.login(new AuthDto.LoginRequest("admin@freshmcalc.com", "secret1"));

        assertEquals("CUSTOMER", res.role());
    }
}
