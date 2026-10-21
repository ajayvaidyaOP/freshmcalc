package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Tradable product (e.g. Pomegranate, Green chilli).
 */
@Entity
@Table(
    name = "products",
    uniqueConstraints = @UniqueConstraint(name = "uk_products_name", columnNames = "name")
)
public class Product extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "category", length = 100)
    private String category; // FRUIT, VEGETABLE, etc.

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, ARCHIVED

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
