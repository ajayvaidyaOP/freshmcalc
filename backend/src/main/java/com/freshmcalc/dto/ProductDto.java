package com.freshmcalc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProductDto {

    public record ProductResponse(
        Long id,
        String name,
        String description,
        String category,
        String status
    ) {}

    public record CreateProductRequest(
        @NotBlank String name,
        String description,
        String category
    ) {}

    public record ProductVarietyResponse(
        Long id,
        Long productId,
        String productName,
        String variety,
        String grade,
        String defaultPackagingUnit,
        String status
    ) {}

    public record CreateProductVarietyRequest(
        Long productId,
        @NotBlank String variety,
        String grade,
        String defaultPackagingUnit
    ) {}
}
