package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Reference country.
 */
@Entity
@Table(
    name = "countries",
    uniqueConstraints = @UniqueConstraint(name = "uk_countries_code", columnNames = "code")
)
public class Country extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, length = 3)
    private String code; // ISO 3166-1 alpha-3

    @Column(name = "currency_code", length = 3)
    private String currencyCode;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCurrencyCode() { return currencyCode; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
}
