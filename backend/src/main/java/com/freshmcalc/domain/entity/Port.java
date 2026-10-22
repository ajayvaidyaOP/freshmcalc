package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Seaport reference with UN/LOCODE. Indian origin ports and Dubai/international destination ports.
 */
@Entity
@Table(
    name = "ports",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_ports_unlocode", columnNames = "unlocode"),
        @UniqueConstraint(name = "uk_ports_name", columnNames = "name")
    }
)
public class Port extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "unlocode", nullable = false, length = 10)
    private String unlocode;

    @Column(name = "port_type", nullable = false, length = 20)
    private String portType; // ORIGIN, DESTINATION, BOTH

    @Column(name = "country_name", length = 100)
    private String countryName;

    @Column(name = "city_name", length = 100)
    private String cityName;

    @Column(name = "supports_container")
    private Boolean supportsContainer = true;

    @Column(name = "supports_reefer")
    private Boolean supportsReefer = false;

    @Column(name = "active")
    private Boolean active = true;

    public Country getCountry() { return country; }
    public void setCountry(Country country) { this.country = country; }

    public City getCity() { return city; }
    public void setCity(City city) { this.city = city; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUnlocode() { return unlocode; }
    public void setUnlocode(String unlocode) { this.unlocode = unlocode; }

    public String getPortType() { return portType; }
    public void setPortType(String portType) { this.portType = portType; }

    public String getCountryName() { return countryName; }
    public void setCountryName(String countryName) { this.countryName = countryName; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public Boolean getSupportsContainer() { return supportsContainer; }
    public void setSupportsContainer(Boolean supportsContainer) { this.supportsContainer = supportsContainer; }

    public Boolean getSupportsReefer() { return supportsReefer; }
    public void setSupportsReefer(Boolean supportsReefer) { this.supportsReefer = supportsReefer; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
