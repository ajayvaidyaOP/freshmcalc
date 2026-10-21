package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Variety and grade of a product (e.g. Pomegranate - Wonderful - Grade A).
 */
@Entity
@Table(
    name = "product_varieties",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_product_varieties_product_variety_grade",
        columnNames = {"product_id", "variety", "grade"}
    )
)
public class ProductVariety extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "variety", nullable = false, length = 100)
    private String variety;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "default_packaging_unit", length = 50)
    private String defaultPackagingUnit; // per kg, per box, per carton, per tonne

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getDefaultPackagingUnit() { return defaultPackagingUnit; }
    public void setDefaultPackagingUnit(String defaultPackagingUnit) { this.defaultPackagingUnit = defaultPackagingUnit; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
