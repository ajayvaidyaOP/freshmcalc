package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * External market data source adapter registry. Keeps track of verified Dubai market feeds.
 */
@Entity
@Table(
    name = "market_data_sources",
    uniqueConstraints = @UniqueConstraint(name = "uk_market_data_sources_name", columnNames = "name")
)
public class MarketDataSource extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "adapter_type", length = 100)
    private String adapterType; // CSV_IMPORT, REST_API, MANUAL

    @Column(name = "endpoint_url", length = 500)
    private String endpointUrl;

    @Column(name = "is_active")
    private Boolean active = false;

    @Column(name = "last_fetch_at")
    private Instant lastFetchAt;

    @Column(name = "last_fetch_status", length = 50)
    private String lastFetchStatus; // SUCCESS, FAILED, NOT_CONFIGURED

    @Column(name = "note", length = 500)
    private String note;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAdapterType() { return adapterType; }
    public void setAdapterType(String adapterType) { this.adapterType = adapterType; }

    public String getEndpointUrl() { return endpointUrl; }
    public void setEndpointUrl(String endpointUrl) { this.endpointUrl = endpointUrl; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Instant getLastFetchAt() { return lastFetchAt; }
    public void setLastFetchAt(Instant lastFetchAt) { this.lastFetchAt = lastFetchAt; }

    public String getLastFetchStatus() { return lastFetchStatus; }
    public void setLastFetchStatus(String lastFetchStatus) { this.lastFetchStatus = lastFetchStatus; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
