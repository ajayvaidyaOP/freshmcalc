package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.AuthService;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication, profile and account lifecycle.
 * Everything under /api/v1/auth is public except /me (see SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@Valid @RequestBody AuthDto.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** Signed-in profile with plan entitlements — powers locks and account screens. */
    @GetMapping("/me")
    public ResponseEntity<AuthDto.MeResponse> me(@AuthenticationPrincipal CustomerUserDetails principal) {
        return ResponseEntity.ok(authService.me(requireEmail(principal)));
    }

    /** Update name, phone, company and location. */
    @PatchMapping("/me")
    public ResponseEntity<AuthDto.MeResponse> updateProfile(
            @AuthenticationPrincipal CustomerUserDetails principal,
            @Valid @RequestBody AuthDto.ProfileUpdateRequest req) {
        return ResponseEntity.ok(authService.updateProfile(requireEmail(principal), req));
    }

    /** Store-required account deletion: anonymises the account and cancels the plan. */
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal CustomerUserDetails principal) {
        authService.deleteAccount(requireEmail(principal));
        return ResponseEntity.noContent().build();
    }

    /** Always returns 200 — never reveals whether the email is registered. */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest req) {
        authService.requestPasswordReset(req.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.ok().build();
    }

    private String requireEmail(CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return principal.getUsername();
    }
}
