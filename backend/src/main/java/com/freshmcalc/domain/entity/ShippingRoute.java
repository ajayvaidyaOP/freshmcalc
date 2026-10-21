package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Configured shipping route between an origin port and a destination port.
 * Not every origin connects directly to every destination.
 */
@Entity
@Table(name = "shipping_routes")
public class ShippingRoute extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "origin_port_id", nullable = false)
    private Port originPort;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_port_id", nullable = false)
    private Port destinationPort;

    @Column(name = "transit_time_days")
    private Integer transitTimeDays;

    @Column(name = "transit_time_source", length = 255)
    private String transitTimeSource;

    @Column(name = "transshipment_required")
    private Boolean transshipmentRequired = false;

    @Column(name = "transshipment_legs", length = 500)
    private String transshipmentLegs;

    @Column(name = "is_operational")
    private Boolean operational = false;

    @Column(name = "activated_at")
    private Instant activatedAt;

    @Column(name = "activated_by", length = 100)
    private String activatedBy;

    public Port getOriginPort() { return originPort; }
    public void setOriginPort(Port originPort) { this.originPort = originPort; }

    public Port getDestinationPort() { return destinationPort; }
    public void setDestinationPort(Port destinationPort) { this.destinationPort = destinationPort; }

    public Integer getTransitTimeDays() { return transitTimeDays; }
    public void setTransitTimeDays(Integer transitTimeDays) { this.transitTimeDays = transitTimeDays; }

    public String getTransitTimeSource() { return transitTimeSource; }
    public void setTransitTimeSource(String transitTimeSource) { this.transitTimeSource = transitTimeSource; }

    public Boolean getTransshipmentRequired() { return transshipmentRequired; }
    public void setTransshipmentRequired(Boolean transshipmentRequired) { this.transshipmentRequired = transshipmentRequired; }

    public String getTransshipmentLegs() { return transshipmentLegs; }
    public void setTransshipmentLegs(String transshipmentLegs) { this.transshipmentLegs = transshipmentLegs; }

    public Boolean getOperational() { return operational; }
    public void setOperational(Boolean operational) { this.operational = operational; }

    public Instant getActivatedAt() { return activatedAt; }
    public void setActivatedAt(Instant activatedAt) { this.activatedAt = activatedAt; }

    public String getActivatedBy() { return activatedBy; }
    public void setActivatedBy(String activatedBy) { this.activatedBy = activatedBy; }
}
