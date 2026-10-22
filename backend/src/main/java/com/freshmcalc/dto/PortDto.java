package com.freshmcalc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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

    public record CountryResponse(Long id, String name, String code, String currencyCode) {}

    public record CityResponse(Long id, Long countryId, String name, String state) {}

    public record CreatePortRequest(
        @NotNull Long countryId,
        @NotNull Long cityId,
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 10) String unlocode,
        @NotBlank @Pattern(regexp = "ORIGIN|DESTINATION|BOTH") String portType,
        Boolean supportsContainer,
        Boolean supportsReefer
    ) {}
}
