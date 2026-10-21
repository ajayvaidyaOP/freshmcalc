package com.freshmcalc.dto;

import jakarta.validation.constraints.NotBlank;

public class PortDto {

    public record PortResponse(
        Long id,
        Long countryId,
        String countryName,
        Long cityId,
        String cityName,
        String name,
        String unlocode,
        String portType,
        Boolean supportsContainer,
        Boolean supportsReefer,
        Boolean active
    ) {}

    public record CreatePortRequest(
        Long countryId,
        Long cityId,
        @NotBlank String name,
        @NotBlank String unlocode,
        String portType,
        Boolean supportsContainer,
        Boolean supportsReefer
    ) {}
}
