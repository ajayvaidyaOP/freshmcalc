package com.freshmcalc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Idempotent webhook event log to prevent duplicate processing.
 */
@Entity
@Table(name = "webhook_events")
public class WebhookEvent extends BaseEntity {

    @Column(name = "event_id", nullable = false, length = 100, unique = true)
    private String eventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "processed")
    private Boolean processed = false;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Boolean getProcessed() { return processed; }
    public void setProcessed(Boolean processed) { this.processed = processed; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}
