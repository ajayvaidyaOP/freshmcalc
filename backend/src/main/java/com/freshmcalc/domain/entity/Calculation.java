package com.freshmcalc.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Saved export cost calculation snapshot. Immutable historical record; values never silently change.
 */
@Entity
@Table(name = "calculations")
public class Calculation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reference_number", nullable = false, length = 100, unique = true)
    private String referenceNumber;

    @Column(name = "product", length = 150)
    private String product;

    @Column(name = "variety", length = 100)
    private String variety;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "packing_centre", length = 200)
    private String packingCentre;

    @Column(name = "origin_city", length = 100)
    private String originCity;

    @Column(name = "origin_port", length = 150)
    private String originPort;

    @Column(name = "destination_country", length = 100)
    private String destinationCountry;

    @Column(name = "destination_city", length = 100)
    private String destinationCity;

    @Column(name = "destination_port", length = 150)
    private String destinationPort;

    @Column(name = "container_type", length = 50)
    private String containerType;

    @Column(name = "number_of_boxes")
    private Integer numberOfBoxes;

    @Column(name = "net_weight_kg", precision = 12, scale = 3)
    private BigDecimal netWeightKg;

    @Column(name = "gross_weight_kg", precision = 12, scale = 3)
    private BigDecimal grossWeightKg;

    @Column(name = "product_cost_per_unit", precision = 12, scale = 4)
    private BigDecimal productCostPerUnit;

    @Column(name = "product_cost_unit", length = 20)
    private String productCostUnit; // per kg, per box

    @Column(name = "expected_dubai_selling_price_per_unit", precision = 12, scale = 4)
    private BigDecimal expectedDubaiSellingPricePerUnit;

    @Column(name = "expected_dubai_selling_price_unit", length = 20)
    private String expectedDubaiSellingPriceUnit;

    @Column(name = "conversion_rate_inr_to_aed", precision = 19, scale = 6)
    private BigDecimal conversionRateInrToAed;

    @Column(name = "conversion_source", length = 255)
    private String conversionSource;

    @Column(name = "formula_version", nullable = false, length = 20)
    private String formulaVersion = "1.0";

    @Column(name = "assumptions", columnDefinition = "TEXT")
    private String assumptions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CalculationStatus status = CalculationStatus.DRAFT;

    // Ordered collection owned by the calculation; cascading removal lets an
    // account deletion clean up its cost sheets without orphan rows.
    @OneToMany(mappedBy = "calculation", fetch = FetchType.LAZY,
        cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<CalculationItem> items = new ArrayList<>();

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getVariety() { return variety; }
    public void setVariety(String variety) { this.variety = variety; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getPackingCentre() { return packingCentre; }
    public void setPackingCentre(String packingCentre) { this.packingCentre = packingCentre; }

    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }

    public String getOriginPort() { return originPort; }
    public void setOriginPort(String originPort) { this.originPort = originPort; }

    public String getDestinationCountry() { return destinationCountry; }
    public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getDestinationPort() { return destinationPort; }
    public void setDestinationPort(String destinationPort) { this.destinationPort = destinationPort; }

    public String getContainerType() { return containerType; }
    public void setContainerType(String containerType) { this.containerType = containerType; }

    public Integer getNumberOfBoxes() { return numberOfBoxes; }
    public void setNumberOfBoxes(Integer numberOfBoxes) { this.numberOfBoxes = numberOfBoxes; }

    public BigDecimal getNetWeightKg() { return netWeightKg; }
    public void setNetWeightKg(BigDecimal netWeightKg) { this.netWeightKg = netWeightKg; }

    public BigDecimal getGrossWeightKg() { return grossWeightKg; }
    public void setGrossWeightKg(BigDecimal grossWeightKg) { this.grossWeightKg = grossWeightKg; }

    public BigDecimal getProductCostPerUnit() { return productCostPerUnit; }
    public void setProductCostPerUnit(BigDecimal productCostPerUnit) { this.productCostPerUnit = productCostPerUnit; }

    public String getProductCostUnit() { return productCostUnit; }
    public void setProductCostUnit(String productCostUnit) { this.productCostUnit = productCostUnit; }

    public BigDecimal getExpectedDubaiSellingPricePerUnit() { return expectedDubaiSellingPricePerUnit; }
    public void setExpectedDubaiSellingPricePerUnit(BigDecimal expectedDubaiSellingPricePerUnit) { this.expectedDubaiSellingPricePerUnit = expectedDubaiSellingPricePerUnit; }

    public String getExpectedDubaiSellingPriceUnit() { return expectedDubaiSellingPriceUnit; }
    public void setExpectedDubaiSellingPriceUnit(String expectedDubaiSellingPriceUnit) { this.expectedDubaiSellingPriceUnit = expectedDubaiSellingPriceUnit; }

    public BigDecimal getConversionRateInrToAed() { return conversionRateInrToAed; }
    public void setConversionRateInrToAed(BigDecimal conversionRateInrToAed) { this.conversionRateInrToAed = conversionRateInrToAed; }

    public String getConversionSource() { return conversionSource; }
    public void setConversionSource(String conversionSource) { this.conversionSource = conversionSource; }

    public String getFormulaVersion() { return formulaVersion; }
    public void setFormulaVersion(String formulaVersion) { this.formulaVersion = formulaVersion; }

    public String getAssumptions() { return assumptions; }
    public void setAssumptions(String assumptions) { this.assumptions = assumptions; }

    public CalculationStatus getStatus() { return status; }
    public void setStatus(CalculationStatus status) { this.status = status; }

    public List<CalculationItem> getItems() { return items; }
    public void setItems(List<CalculationItem> items) { this.items = items; }
}
