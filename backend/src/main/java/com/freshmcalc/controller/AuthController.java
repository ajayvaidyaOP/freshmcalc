package com.freshmcalc.controller;

import com.freshmcalc.domain.service.AuthService;
import com.freshmcalc.dto.AuthDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
