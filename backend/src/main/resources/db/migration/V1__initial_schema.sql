-- FreshmCalc initial schema
-- All monetary amounts use DECIMAL(19,4) or DECIMAL(12,2/4) to avoid floating-point errors.

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    company VARCHAR(200),
    country VARCHAR(100),
    city VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMP
);

CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    currency_code VARCHAR(3),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id),
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE ports (
    id BIGSERIAL PRIMARY KEY,
    country_id BIGINT NOT NULL REFERENCES countries(id),
    city_id BIGINT NOT NULL REFERENCES cities(id),
    name VARCHAR(150) NOT NULL UNIQUE,
    unlocode VARCHAR(10) NOT NULL UNIQUE,
    port_type VARCHAR(20) NOT NULL,
    country_name VARCHAR(100),
    city_name VARCHAR(100),
    supports_container BOOLEAN NOT NULL DEFAULT TRUE,
    supports_reefer BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE product_varieties (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    variety VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    default_packaging_unit VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_product_varieties_product_variety_grade UNIQUE (product_id, variety, grade)
);

CREATE TABLE market_data_sources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    adapter_type VARCHAR(100),
    endpoint_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT FALSE,
    last_fetch_at TIMESTAMP,
    last_fetch_status VARCHAR(50),
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE market_rates (
    id BIGSERIAL PRIMARY KEY,
    product_variety_id BIGINT NOT NULL REFERENCES product_varieties(id),
    market_name VARCHAR(150) NOT NULL DEFAULT 'Dubai, UAE',
    country VARCHAR(100) NOT NULL DEFAULT 'UAE',
    city VARCHAR(100) NOT NULL DEFAULT 'Dubai',
    price_amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'AED',
    pricing_unit VARCHAR(50) NOT NULL,
    packaging_details VARCHAR(255),
    origin_country VARCHAR(100),
    effective_date_time TIMESTAMP NOT NULL,
    last_updated TIMESTAMP,
    data_source VARCHAR(200),
    source_reference VARCHAR(255),
    is_automatically_fetched BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    updated_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100)
);

-- Note: BaseEntity auditing columns map to created_at/updated_at/created_by/updated_by.

CREATE TABLE market_rate_history (
    id BIGSERIAL PRIMARY KEY,
    market_rate_id BIGINT NOT NULL REFERENCES market_rates(id),
    price_amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    pricing_unit VARCHAR(50) NOT NULL,
    effective_date_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(100),
    change_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_cycle VARCHAR(20) NOT NULL,
    razorpay_plan_id VARCHAR(100),
    dubai_rates_access BOOLEAN NOT NULL DEFAULT TRUE,
    calculator_access BOOLEAN NOT NULL DEFAULT TRUE,
    pdf_export_access BOOLEAN NOT NULL DEFAULT TRUE,
    saved_calculations_access BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    razorpay_subscription_id VARCHAR(100),
    razorpay_customer_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    amount_paid DECIMAL(12,2),
    currency VARCHAR(10),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    description VARCHAR(255),
    receipt_url VARCHAR(500),
    paid_at TIMESTAMP,
    failure_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    payload TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE shipping_routes (
    id BIGSERIAL PRIMARY KEY,
    origin_port_id BIGINT NOT NULL REFERENCES ports(id),
    destination_port_id BIGINT NOT NULL REFERENCES ports(id),
    transit_time_days INTEGER,
    transit_time_source VARCHAR(255),
    transshipment_required BOOLEAN NOT NULL DEFAULT FALSE,
    transshipment_legs VARCHAR(500),
    operational BOOLEAN NOT NULL DEFAULT FALSE,
    activated_at TIMESTAMP,
    activated_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE freight_quotes (
    id BIGSERIAL PRIMARY KEY,
    route_id BIGINT NOT NULL REFERENCES shipping_routes(id),
    container_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    source VARCHAR(255),
    effective_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(19,6) NOT NULL,
    effective_date TIMESTAMP NOT NULL,
    source VARCHAR(255),
    is_manually_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    CONSTRAINT uk_exchange_rates_pair_date UNIQUE (from_currency, to_currency, effective_date)
);

CREATE TABLE expense_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    default_amount DECIMAL(12,2),
    default_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    is_percentage BOOLEAN NOT NULL DEFAULT FALSE,
    percentage_base VARCHAR(100),
    applicable_by_default BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE calculations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    product VARCHAR(150),
    variety VARCHAR(100),
    grade VARCHAR(50),
    packing_centre VARCHAR(200),
    origin_city VARCHAR(100),
    origin_port VARCHAR(150),
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    destination_port VARCHAR(150),
    container_type VARCHAR(50),
    number_of_boxes INTEGER,
    net_weight_kg DECIMAL(12,3),
    gross_weight_kg DECIMAL(12,3),
    product_cost_per_unit DECIMAL(12,4),
    product_cost_unit VARCHAR(20),
    expected_dubai_selling_price_per_unit DECIMAL(12,4),
    expected_dubai_selling_price_unit VARCHAR(20),
    conversion_rate_inr_to_aed DECIMAL(19,6),
    conversion_source VARCHAR(255),
    formula_version VARCHAR(20) NOT NULL DEFAULT '1.0',
    assumptions TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE calculation_items (
    id BIGSERIAL PRIMARY KEY,
    calculation_id BIGINT NOT NULL REFERENCES calculations(id),
    expense_category VARCHAR(100) NOT NULL,
    expense_name VARCHAR(150) NOT NULL,
    amount DECIMAL(12,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    amount_aed DECIMAL(12,4),
    cost_group VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE generated_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    calculation_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    download_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor VARCHAR(100),
    actor_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_market_rates_product_variety ON market_rates(product_variety_id);
CREATE INDEX idx_market_rates_status ON market_rates(status);
CREATE INDEX idx_market_rates_last_updated ON market_rates(last_updated);
CREATE INDEX idx_market_rate_history_market_rate ON market_rate_history(market_rate_id);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculation_items_calculation ON calculation_items(calculation_id);
CREATE INDEX idx_shipping_routes_origin_dest ON shipping_routes(origin_port_id, destination_port_id);
CREATE INDEX idx_freight_quotes_route ON freight_quotes(route_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
