package com.freshmcalc.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password
    ) {}

    public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        String firstName,
        String lastName,
        String phone,
        String company,
        String country,
        String city
    ) {}

    public record AuthResponse(
        String token,
        String email,
        String role,
        String status
    ) {}

    /**
     * Full signed-in profile used by the app shell: identity, plan
     * entitlements and the active subscription. Powers lock/unlock in the UI.
     */
    public record MeResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        String company,
        String country,
        String city,
        String role,
        String status,
        SubscriptionDto.PlanEntitlements planEntitlements,
        SubscriptionDto.SubscriptionResponse activeSubscription
    ) {}

    public record ForgotPasswordRequest(@Email @NotBlank String email) {}
    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 6) String newPassword
    ) {}
}
