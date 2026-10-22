package com.freshmcalc.controller;

import com.freshmcalc.config.security.CustomerUserDetails;
import com.freshmcalc.domain.service.AuthService;
import com.freshmcalc.dto.AuthDto;
import com.freshmcalc.exception.BadRequestException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/me")
    public ResponseEntity<AuthDto.MeResponse> me(@AuthenticationPrincipal CustomerUserDetails principal) {
        if (principal == null) {
            throw new BadRequestException("Authentication required.");
        }
        return ResponseEntity.ok(authService.me(principal.getUsername()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest req) {
        // Implementation would send a reset token via email. Stubbed for structure.
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest req) {
        // Implementation would validate token and update password. Stubbed for structure.
        return ResponseEntity.ok().build();
    }
}
