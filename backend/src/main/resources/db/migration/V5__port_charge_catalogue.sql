-- Non-destructive port charge catalogue. Existing port and freight quote rows are retained.
CREATE TABLE port_charges (
    id BIGSERIAL PRIMARY KEY,
    port_id BIGINT NOT NULL REFERENCES ports(id),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('ORIGIN', 'DESTINATION')),
    charge_category VARCHAR(60) NOT NULL,
    description VARCHAR(180) NOT NULL,
    amount DECIMAL(19,4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    charging_basis VARCHAR(20) NOT NULL CHECK (charging_basis IN ('PER_SHIPMENT', 'PER_CONTAINER', 'PER_KG', 'PER_TONNE', 'PER_CARTON')),
    shipping_mode VARCHAR(12) NOT NULL DEFAULT 'SEA' CHECK (shipping_mode IN ('SEA', 'AIR', 'ROAD', 'RAIL', 'ANY')),
    container_type VARCHAR(30),
    product_name VARCHAR(150),
    conditions VARCHAR(500),
    effective_from TIMESTAMP NOT NULL,
    effective_until TIMESTAMP,
    source VARCHAR(255),
    last_verified_at TIMESTAMP,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'UNCONFIRMED'
        CHECK (verification_status IN ('VERIFIED', 'INDICATIVE', 'UNCONFIRMED')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT chk_port_charge_validity CHECK (effective_until IS NULL OR effective_until > effective_from)
);

CREATE INDEX idx_port_charges_port_active ON port_charges(port_id, active);
CREATE INDEX idx_port_charges_route_match ON port_charges(direction, shipping_mode, container_type, effective_from);
-- Prevent accidental duplicate entry of the same published record while allowing distinct sources and validity periods.
CREATE UNIQUE INDEX uk_port_charge_record ON port_charges(
    port_id, direction, charge_category, description, currency, charging_basis,
    shipping_mode, COALESCE(container_type, ''), COALESCE(product_name, ''), effective_from,
    COALESCE(source, '')
);
