package com.freshmcalc.controller;

import com.freshmcalc.domain.service.ProductService;
import com.freshmcalc.dto.ProductDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDto.ProductResponse>> listProducts() {
        return ResponseEntity.ok(productService.listProducts());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductResponse> createProduct(@Valid @RequestBody ProductDto.CreateProductRequest req) {
        return ResponseEntity.ok(productService.createProduct(req));
    }

    @GetMapping("/varieties")
    public ResponseEntity<List<ProductDto.ProductVarietyResponse>> listVarieties() {
        return ResponseEntity.ok(productService.listVarieties());
    }

    @PostMapping("/varieties")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto.ProductVarietyResponse> createVariety(@Valid @RequestBody ProductDto.CreateProductVarietyRequest req) {
        return ResponseEntity.ok(productService.createVariety(req));
    }
}
