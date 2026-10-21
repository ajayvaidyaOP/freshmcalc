package com.freshmcalc.domain.service;

import com.freshmcalc.domain.entity.Product;
import com.freshmcalc.domain.entity.ProductVariety;
import com.freshmcalc.domain.repository.ProductRepository;
import com.freshmcalc.domain.repository.ProductVarietyRepository;
import com.freshmcalc.dto.ProductDto;
import com.freshmcalc.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVarietyRepository varietyRepository;

    public ProductService(ProductRepository productRepository, ProductVarietyRepository varietyRepository) {
        this.productRepository = productRepository;
        this.varietyRepository = varietyRepository;
    }

    public List<ProductDto.ProductResponse> listProducts() {
        return productRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductDto.ProductResponse createProduct(ProductDto.CreateProductRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setCategory(req.category());
        p.setStatus("ACTIVE");
        return toResponse(productRepository.save(p));
    }

    public List<ProductDto.ProductVarietyResponse> listVarieties() {
        return varietyRepository.findAll().stream().map(this::toVarietyResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductDto.ProductVarietyResponse createVariety(ProductDto.CreateProductVarietyRequest req) {
        Product product = productRepository.findById(req.productId())
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.productId()));
        ProductVariety v = new ProductVariety();
        v.setProduct(product);
        v.setVariety(req.variety());
        v.setGrade(req.grade());
        v.setDefaultPackagingUnit(req.defaultPackagingUnit());
        v.setStatus("ACTIVE");
        return toVarietyResponse(varietyRepository.save(v));
    }

    private ProductDto.ProductResponse toResponse(Product p) {
        return new ProductDto.ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getCategory(), p.getStatus());
    }

    private ProductDto.ProductVarietyResponse toVarietyResponse(ProductVariety v) {
        return new ProductDto.ProductVarietyResponse(
            v.getId(), v.getProduct().getId(), v.getProduct().getName(), v.getVariety(), v.getGrade(),
            v.getDefaultPackagingUnit(), v.getStatus());
    }
}
