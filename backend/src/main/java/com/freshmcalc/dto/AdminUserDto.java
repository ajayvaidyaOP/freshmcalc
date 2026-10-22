package com.freshmcalc.dto;

import java.time.Instant;

public class AdminUserDto {
    public record AdminUserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String company,
        String role,
        String status,
        Instant createdAt,
        String activePlanName,
        Instant currentPeriodEnd
    ) {}
}
