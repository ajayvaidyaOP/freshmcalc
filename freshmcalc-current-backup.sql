--
-- PostgreSQL database dump
--

\restrict ejjActFCxmrF7L0UhUhPZGxMBKwXUYEcTGQSKLqCDaqQ1En6TFlnvHee5ObBTXP

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    actor character varying(100),
    actor_role character varying(20),
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(100),
    old_values text,
    new_values text,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.audit_logs OWNER TO freshmcalc;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO freshmcalc;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: calculation_items; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.calculation_items (
    id bigint NOT NULL,
    calculation_id bigint NOT NULL,
    expense_category character varying(100) NOT NULL,
    expense_name character varying(150) NOT NULL,
    amount numeric(12,4) NOT NULL,
    currency character varying(10) NOT NULL,
    amount_aed numeric(12,4),
    cost_group character varying(30) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.calculation_items OWNER TO freshmcalc;

--
-- Name: calculation_items_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.calculation_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculation_items_id_seq OWNER TO freshmcalc;

--
-- Name: calculation_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.calculation_items_id_seq OWNED BY public.calculation_items.id;


--
-- Name: calculations; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.calculations (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    reference_number character varying(100) NOT NULL,
    product character varying(150),
    variety character varying(100),
    grade character varying(50),
    packing_centre character varying(200),
    origin_city character varying(100),
    origin_port character varying(150),
    destination_country character varying(100),
    destination_city character varying(100),
    destination_port character varying(150),
    container_type character varying(50),
    number_of_boxes integer,
    net_weight_kg numeric(12,3),
    gross_weight_kg numeric(12,3),
    product_cost_per_unit numeric(12,4),
    product_cost_unit character varying(20),
    expected_dubai_selling_price_per_unit numeric(12,4),
    expected_dubai_selling_price_unit character varying(20),
    conversion_rate_inr_to_aed numeric(19,6),
    conversion_source character varying(255),
    formula_version character varying(20) DEFAULT '1.0'::character varying NOT NULL,
    assumptions text,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.calculations OWNER TO freshmcalc;

--
-- Name: calculations_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.calculations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calculations_id_seq OWNER TO freshmcalc;

--
-- Name: calculations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.calculations_id_seq OWNED BY public.calculations.id;


--
-- Name: cities; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.cities (
    id bigint NOT NULL,
    country_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    state character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.cities OWNER TO freshmcalc;

--
-- Name: cities_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.cities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cities_id_seq OWNER TO freshmcalc;

--
-- Name: cities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.cities_id_seq OWNED BY public.cities.id;


--
-- Name: countries; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.countries (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(3) NOT NULL,
    currency_code character varying(3),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.countries OWNER TO freshmcalc;

--
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.countries_id_seq OWNER TO freshmcalc;

--
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.countries_id_seq OWNED BY public.countries.id;


--
-- Name: exchange_rates; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.exchange_rates (
    id bigint NOT NULL,
    from_currency character varying(3) NOT NULL,
    to_currency character varying(3) NOT NULL,
    rate numeric(19,6) NOT NULL,
    effective_date timestamp without time zone NOT NULL,
    source character varying(255),
    is_manually_approved boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.exchange_rates OWNER TO freshmcalc;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.exchange_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exchange_rates_id_seq OWNER TO freshmcalc;

--
-- Name: exchange_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.exchange_rates_id_seq OWNED BY public.exchange_rates.id;


--
-- Name: expense_templates; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.expense_templates (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    category character varying(100) NOT NULL,
    default_amount numeric(12,2),
    default_currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    is_percentage boolean DEFAULT false NOT NULL,
    percentage_base character varying(100),
    is_applicable_by_default boolean DEFAULT true NOT NULL,
    notes character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.expense_templates OWNER TO freshmcalc;

--
-- Name: expense_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.expense_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expense_templates_id_seq OWNER TO freshmcalc;

--
-- Name: expense_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.expense_templates_id_seq OWNED BY public.expense_templates.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO freshmcalc;

--
-- Name: freight_quotes; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.freight_quotes (
    id bigint NOT NULL,
    route_id bigint NOT NULL,
    container_type character varying(50) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying NOT NULL,
    source character varying(255),
    effective_date timestamp without time zone NOT NULL,
    expiry_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.freight_quotes OWNER TO freshmcalc;

--
-- Name: freight_quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.freight_quotes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.freight_quotes_id_seq OWNER TO freshmcalc;

--
-- Name: freight_quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.freight_quotes_id_seq OWNED BY public.freight_quotes.id;


--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.generated_documents (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    calculation_id bigint NOT NULL,
    document_type character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_path character varying(500),
    download_url character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.generated_documents OWNER TO freshmcalc;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.generated_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.generated_documents_id_seq OWNER TO freshmcalc;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.generated_documents_id_seq OWNED BY public.generated_documents.id;


--
-- Name: market_data_sources; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.market_data_sources (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    adapter_type character varying(100),
    endpoint_url character varying(500),
    is_active boolean DEFAULT false NOT NULL,
    last_fetch_at timestamp without time zone,
    last_fetch_status character varying(50),
    note character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.market_data_sources OWNER TO freshmcalc;

--
-- Name: market_data_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.market_data_sources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_data_sources_id_seq OWNER TO freshmcalc;

--
-- Name: market_data_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.market_data_sources_id_seq OWNED BY public.market_data_sources.id;


--
-- Name: market_rate_history; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.market_rate_history (
    id bigint NOT NULL,
    market_rate_id bigint NOT NULL,
    price_amount numeric(19,4) NOT NULL,
    currency character varying(10) NOT NULL,
    pricing_unit character varying(50) NOT NULL,
    effective_date_time timestamp without time zone NOT NULL,
    status character varying(20) NOT NULL,
    changed_by character varying(100),
    change_reason character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.market_rate_history OWNER TO freshmcalc;

--
-- Name: market_rate_history_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.market_rate_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_rate_history_id_seq OWNER TO freshmcalc;

--
-- Name: market_rate_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.market_rate_history_id_seq OWNED BY public.market_rate_history.id;


--
-- Name: market_rates; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.market_rates (
    id bigint NOT NULL,
    product_variety_id bigint NOT NULL,
    market_name character varying(150) DEFAULT 'Dubai, UAE'::character varying NOT NULL,
    country character varying(100) DEFAULT 'UAE'::character varying NOT NULL,
    city character varying(100) DEFAULT 'Dubai'::character varying NOT NULL,
    price_amount numeric(19,4) NOT NULL,
    currency character varying(10) DEFAULT 'AED'::character varying NOT NULL,
    pricing_unit character varying(50) NOT NULL,
    packaging_details character varying(255),
    origin_country character varying(100),
    effective_date_time timestamp without time zone NOT NULL,
    last_updated timestamp without time zone,
    data_source character varying(200),
    source_reference character varying(255),
    is_automatically_fetched boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    updated_by character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100)
);


ALTER TABLE public.market_rates OWNER TO freshmcalc;

--
-- Name: market_rates_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.market_rates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.market_rates_id_seq OWNER TO freshmcalc;

--
-- Name: market_rates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.market_rates_id_seq OWNED BY public.market_rates.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    type character varying(30) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp without time zone,
    action_url character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.notifications OWNER TO freshmcalc;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO freshmcalc;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    razorpay_order_id character varying(100),
    razorpay_payment_id character varying(100),
    razorpay_subscription_id character varying(100),
    amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    description character varying(255),
    receipt_url character varying(500),
    paid_at timestamp without time zone,
    failure_reason character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.payments OWNER TO freshmcalc;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO freshmcalc;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: ports; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.ports (
    id bigint NOT NULL,
    country_id bigint NOT NULL,
    city_id bigint NOT NULL,
    name character varying(150) NOT NULL,
    unlocode character varying(10) NOT NULL,
    port_type character varying(20) NOT NULL,
    country_name character varying(100),
    city_name character varying(100),
    supports_container boolean DEFAULT true NOT NULL,
    supports_reefer boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.ports OWNER TO freshmcalc;

--
-- Name: ports_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.ports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ports_id_seq OWNER TO freshmcalc;

--
-- Name: ports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.ports_id_seq OWNED BY public.ports.id;


--
-- Name: product_varieties; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.product_varieties (
    id bigint NOT NULL,
    product_id bigint NOT NULL,
    variety character varying(100) NOT NULL,
    grade character varying(50),
    default_packaging_unit character varying(50),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.product_varieties OWNER TO freshmcalc;

--
-- Name: product_varieties_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.product_varieties_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_varieties_id_seq OWNER TO freshmcalc;

--
-- Name: product_varieties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.product_varieties_id_seq OWNED BY public.product_varieties.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    name character varying(150) NOT NULL,
    description character varying(500),
    category character varying(100),
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.products OWNER TO freshmcalc;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO freshmcalc;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: shipping_routes; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.shipping_routes (
    id bigint NOT NULL,
    origin_port_id bigint NOT NULL,
    destination_port_id bigint NOT NULL,
    transit_time_days integer,
    transit_time_source character varying(255),
    transshipment_required boolean DEFAULT false NOT NULL,
    transshipment_legs character varying(500),
    is_operational boolean DEFAULT false NOT NULL,
    activated_at timestamp without time zone,
    activated_by character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.shipping_routes OWNER TO freshmcalc;

--
-- Name: shipping_routes_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.shipping_routes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipping_routes_id_seq OWNER TO freshmcalc;

--
-- Name: shipping_routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.shipping_routes_id_seq OWNED BY public.shipping_routes.id;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.subscription_plans (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    price_amount numeric(12,2) NOT NULL,
    currency character varying(10) DEFAULT 'INR'::character varying NOT NULL,
    billing_cycle character varying(20) NOT NULL,
    razorpay_plan_id character varying(100),
    dubai_rates_access boolean DEFAULT true NOT NULL,
    calculator_access boolean DEFAULT true NOT NULL,
    pdf_export_access boolean DEFAULT true NOT NULL,
    saved_calculations_access boolean DEFAULT true NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.subscription_plans OWNER TO freshmcalc;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.subscription_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO freshmcalc;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    plan_id bigint NOT NULL,
    razorpay_subscription_id character varying(100),
    razorpay_customer_id character varying(100),
    status character varying(20) DEFAULT 'INACTIVE'::character varying NOT NULL,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    amount_paid numeric(12,2),
    currency character varying(10),
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    ended_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.subscriptions OWNER TO freshmcalc;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO freshmcalc;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(50),
    company character varying(200),
    country character varying(100),
    city character varying(100),
    role character varying(20) DEFAULT 'CUSTOMER'::character varying NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    email_verification_token character varying(255),
    password_reset_token character varying(255),
    password_reset_expiry timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100),
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO freshmcalc;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO freshmcalc;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: webhook_events; Type: TABLE; Schema: public; Owner: freshmcalc
--

CREATE TABLE public.webhook_events (
    id bigint NOT NULL,
    event_id character varying(100) NOT NULL,
    event_type character varying(100) NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    payload text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone,
    created_by character varying(100),
    updated_by character varying(100)
);


ALTER TABLE public.webhook_events OWNER TO freshmcalc;

--
-- Name: webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: freshmcalc
--

CREATE SEQUENCE public.webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.webhook_events_id_seq OWNER TO freshmcalc;

--
-- Name: webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: freshmcalc
--

ALTER SEQUENCE public.webhook_events_id_seq OWNED BY public.webhook_events.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: calculation_items id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculation_items ALTER COLUMN id SET DEFAULT nextval('public.calculation_items_id_seq'::regclass);


--
-- Name: calculations id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculations ALTER COLUMN id SET DEFAULT nextval('public.calculations_id_seq'::regclass);


--
-- Name: cities id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.cities ALTER COLUMN id SET DEFAULT nextval('public.cities_id_seq'::regclass);


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.countries_id_seq'::regclass);


--
-- Name: exchange_rates id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.exchange_rates ALTER COLUMN id SET DEFAULT nextval('public.exchange_rates_id_seq'::regclass);


--
-- Name: expense_templates id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.expense_templates ALTER COLUMN id SET DEFAULT nextval('public.expense_templates_id_seq'::regclass);


--
-- Name: freight_quotes id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.freight_quotes ALTER COLUMN id SET DEFAULT nextval('public.freight_quotes_id_seq'::regclass);


--
-- Name: generated_documents id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.generated_documents ALTER COLUMN id SET DEFAULT nextval('public.generated_documents_id_seq'::regclass);


--
-- Name: market_data_sources id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_data_sources ALTER COLUMN id SET DEFAULT nextval('public.market_data_sources_id_seq'::regclass);


--
-- Name: market_rate_history id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rate_history ALTER COLUMN id SET DEFAULT nextval('public.market_rate_history_id_seq'::regclass);


--
-- Name: market_rates id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rates ALTER COLUMN id SET DEFAULT nextval('public.market_rates_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: ports id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports ALTER COLUMN id SET DEFAULT nextval('public.ports_id_seq'::regclass);


--
-- Name: product_varieties id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.product_varieties ALTER COLUMN id SET DEFAULT nextval('public.product_varieties_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: shipping_routes id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.shipping_routes ALTER COLUMN id SET DEFAULT nextval('public.shipping_routes_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: webhook_events id; Type: DEFAULT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.webhook_events ALTER COLUMN id SET DEFAULT nextval('public.webhook_events_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.audit_logs (id, actor, actor_role, action, entity_type, entity_id, old_values, new_values, ip_address, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: calculation_items; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.calculation_items (id, calculation_id, expense_category, expense_name, amount, currency, amount_aed, cost_group, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: calculations; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.calculations (id, user_id, reference_number, product, variety, grade, packing_centre, origin_city, origin_port, destination_country, destination_city, destination_port, container_type, number_of_boxes, net_weight_kg, gross_weight_kg, product_cost_per_unit, product_cost_unit, expected_dubai_selling_price_per_unit, expected_dubai_selling_price_unit, conversion_rate_inr_to_aed, conversion_source, formula_version, assumptions, status, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.cities (id, country_id, name, state, created_at, updated_at, created_by, updated_by) FROM stdin;
1	1	Mumbai	Maharashtra	2026-10-22 14:21:30.388676	\N	\N	\N
2	1	Mundra	Gujarat	2026-10-22 14:21:30.388676	\N	\N	\N
3	1	Kandla	Gujarat	2026-10-22 14:21:30.388676	\N	\N	\N
4	1	Hazira	Gujarat	2026-10-22 14:21:30.388676	\N	\N	\N
5	1	Chennai	Tamil Nadu	2026-10-22 14:21:30.388676	\N	\N	\N
6	1	Cochin	Kerala	2026-10-22 14:21:30.388676	\N	\N	\N
7	1	Visakhapatnam	Andhra Pradesh	2026-10-22 14:21:30.388676	\N	\N	\N
8	1	Kolkata	West Bengal	2026-10-22 14:21:30.388676	\N	\N	\N
9	1	Tuticorin	Tamil Nadu	2026-10-22 14:21:30.388676	\N	\N	\N
10	2	Dubai	Dubai	2026-10-22 14:21:30.388676	\N	\N	\N
11	2	Abu Dhabi	Abu Dhabi	2026-10-22 14:21:30.388676	\N	\N	\N
12	2	Khor Fakkan	Sharjah	2026-10-22 14:21:30.388676	\N	\N	\N
13	3	Dammam	Eastern Province	2026-10-22 14:21:30.388676	\N	\N	\N
14	3	Jeddah	Makkah	2026-10-22 14:21:30.388676	\N	\N	\N
15	4	Doha	Doha	2026-10-22 14:21:30.388676	\N	\N	\N
16	5	Sohar	Sohar	2026-10-22 14:21:30.388676	\N	\N	\N
17	6	Singapore	Singapore	2026-10-22 14:21:30.388676	\N	\N	\N
18	7	Rotterdam	South Holland	2026-10-22 14:21:30.388676	\N	\N	\N
19	8	Felixstowe	Suffolk	2026-10-22 14:21:30.388676	\N	\N	\N
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.countries (id, name, code, currency_code, created_at, updated_at, created_by, updated_by) FROM stdin;
1	India	IND	INR	2026-10-22 14:21:30.388676	\N	\N	\N
2	United Arab Emirates	ARE	AED	2026-10-22 14:21:30.388676	\N	\N	\N
3	Saudi Arabia	SAU	SAR	2026-10-22 14:21:30.388676	\N	\N	\N
4	Qatar	QAT	QAR	2026-10-22 14:21:30.388676	\N	\N	\N
5	Oman	OMN	OMR	2026-10-22 14:21:30.388676	\N	\N	\N
6	Singapore	SGP	SGD	2026-10-22 14:21:30.388676	\N	\N	\N
7	Netherlands	NLD	EUR	2026-10-22 14:21:30.388676	\N	\N	\N
8	United Kingdom	GBR	GBP	2026-10-22 14:21:30.388676	\N	\N	\N
\.


--
-- Data for Name: exchange_rates; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.exchange_rates (id, from_currency, to_currency, rate, effective_date, source, is_manually_approved, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: expense_templates; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.expense_templates (id, name, category, default_amount, default_currency, is_percentage, percentage_base, is_applicable_by_default, notes, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	initial schema	SQL	V1__initial_schema.sql	-1597254691	freshmcalc	2026-10-22 14:21:29.796625	450	t
2	2	reference data	SQL	V2__reference_data.sql	-2097211517	freshmcalc	2026-10-22 14:21:30.375368	26	t
3	3	fix expense template column	SQL	V3__fix_expense_template_column.sql	-1721424753	freshmcalc	2026-10-22 14:21:30.422543	3	t
4	4	rename market data source active column	SQL	V4__rename_market_data_source_active_column.sql	-2025292744	freshmcalc	2026-10-22 14:21:30.440504	3	t
5	5	rename active columns	SQL	V5__rename_active_columns.sql	683658456	freshmcalc	2026-10-22 14:21:30.457904	4	t
6	6	rename shipping route operational column	SQL	V6__rename_shipping_route_operational_column.sql	-1715283158	freshmcalc	2026-10-22 14:21:30.473927	3	t
\.


--
-- Data for Name: freight_quotes; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.freight_quotes (id, route_id, container_type, amount, currency, source, effective_date, expiry_date, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: generated_documents; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.generated_documents (id, user_id, calculation_id, document_type, file_name, file_path, download_url, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: market_data_sources; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.market_data_sources (id, name, adapter_type, endpoint_url, is_active, last_fetch_at, last_fetch_status, note, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: market_rate_history; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.market_rate_history (id, market_rate_id, price_amount, currency, pricing_unit, effective_date_time, status, changed_by, change_reason, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: market_rates; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.market_rates (id, product_variety_id, market_name, country, city, price_amount, currency, pricing_unit, packaging_details, origin_country, effective_date_time, last_updated, data_source, source_reference, is_automatically_fetched, status, updated_by, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.notifications (id, user_id, title, message, type, is_read, read_at, action_url, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.payments (id, user_id, razorpay_order_id, razorpay_payment_id, razorpay_subscription_id, amount, currency, status, description, receipt_url, paid_at, failure_reason, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: ports; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.ports (id, country_id, city_id, name, unlocode, port_type, country_name, city_name, supports_container, supports_reefer, is_active, created_at, updated_at, created_by, updated_by) FROM stdin;
1	1	1	JNPA / Nhava Sheva	INNSA	ORIGIN	India	Mumbai	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
2	1	1	Mumbai Port	INBOM	ORIGIN	India	Mumbai	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
3	1	2	Mundra Port	INMUN	ORIGIN	India	Mundra	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
4	1	3	Deendayal / Kandla	INIXY	ORIGIN	India	Kandla	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
5	1	4	Hazira Port	INHZA	ORIGIN	India	Hazira	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
6	1	5	Chennai Port	INMAA	ORIGIN	India	Chennai	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
7	1	6	Cochin Port	INCOK	ORIGIN	India	Cochin	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
8	1	7	Visakhapatnam Port	INVTZ	ORIGIN	India	Visakhapatnam	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
9	1	8	Kolkata/Haldia	INCCU	ORIGIN	India	Kolkata	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
10	1	9	V.O. Chidambaranar	INTUT	ORIGIN	India	Tuticorin	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
11	2	10	Jebel Ali Port, Dubai	AEJEA	DESTINATION	UAE	Dubai	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
12	2	11	Khalifa Port, Abu Dhabi	AUAUH	DESTINATION	UAE	Abu Dhabi	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
13	2	12	Khor Fakkan Port	AEKLF	DESTINATION	UAE	Khor Fakkan	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
14	3	13	Dammam Port	SADMM	DESTINATION	Saudi Arabia	Dammam	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
15	3	14	Jeddah Port	SAJED	DESTINATION	Saudi Arabia	Jeddah	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
16	4	15	Hamad Port	QAHDD	DESTINATION	Qatar	Doha	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
17	5	16	Sohar Port	OMSOH	DESTINATION	Oman	Sohar	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
18	6	17	Port of Singapore	SGSIN	DESTINATION	Singapore	Singapore	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
19	7	18	Port of Rotterdam	NLRTM	DESTINATION	Netherlands	Rotterdam	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
20	8	19	Port of Felixstowe	GBFEL	DESTINATION	United Kingdom	Felixstowe	t	t	t	2026-10-22 14:21:30.388676	\N	\N	\N
\.


--
-- Data for Name: product_varieties; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.product_varieties (id, product_id, variety, grade, default_packaging_unit, status, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.products (id, name, description, category, status, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: shipping_routes; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.shipping_routes (id, origin_port_id, destination_port_id, transit_time_days, transit_time_source, transshipment_required, transshipment_legs, is_operational, activated_at, activated_by, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.subscription_plans (id, name, description, price_amount, currency, billing_cycle, razorpay_plan_id, dubai_rates_access, calculator_access, pdf_export_access, saved_calculations_access, is_active, sort_order, created_at, updated_at, created_by, updated_by) FROM stdin;
1	Monthly	Monthly access to Dubai market rates and export calculator	49900.00	INR	MONTHLY	\N	t	t	t	t	t	1	2026-10-22 14:21:30.388676	\N	\N	\N
2	Quarterly	Quarterly access to Dubai market rates and export calculator	129900.00	INR	QUARTERLY	\N	t	t	t	t	t	2	2026-10-22 14:21:30.388676	\N	\N	\N
3	Yearly	Yearly access to Dubai market rates and export calculator	499900.00	INR	YEARLY	\N	t	t	t	t	t	3	2026-10-22 14:21:30.388676	\N	\N	\N
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.subscriptions (id, user_id, plan_id, razorpay_subscription_id, razorpay_customer_id, status, current_period_start, current_period_end, amount_paid, currency, cancel_at_period_end, ended_at, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.users (id, email, password_hash, first_name, last_name, phone, company, country, city, role, status, email_verified, email_verification_token, password_reset_token, password_reset_expiry, created_at, updated_at, created_by, updated_by, deleted_at) FROM stdin;
1	admin@freshmcalc.com	$2a$10$gZ.WekSMo2LfxY2pj1sCsuspTfG8d4OWI.5WBR7re0cDEhlPz.Iqq	Admin		\N	\N	\N	\N	ADMIN	ACTIVE	t	\N	\N	\N	2026-10-22 14:21:40.678104	2026-10-22 14:21:40.678104	system	system	\N
\.


--
-- Data for Name: webhook_events; Type: TABLE DATA; Schema: public; Owner: freshmcalc
--

COPY public.webhook_events (id, event_id, event_type, processed, payload, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: calculation_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.calculation_items_id_seq', 1, false);


--
-- Name: calculations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.calculations_id_seq', 1, false);


--
-- Name: cities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.cities_id_seq', 19, true);


--
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.countries_id_seq', 8, true);


--
-- Name: exchange_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.exchange_rates_id_seq', 1, false);


--
-- Name: expense_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.expense_templates_id_seq', 1, false);


--
-- Name: freight_quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.freight_quotes_id_seq', 1, false);


--
-- Name: generated_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.generated_documents_id_seq', 1, false);


--
-- Name: market_data_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.market_data_sources_id_seq', 1, false);


--
-- Name: market_rate_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.market_rate_history_id_seq', 1, false);


--
-- Name: market_rates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.market_rates_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: ports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.ports_id_seq', 20, true);


--
-- Name: product_varieties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.product_varieties_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: shipping_routes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.shipping_routes_id_seq', 1, false);


--
-- Name: subscription_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.subscription_plans_id_seq', 3, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: webhook_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: freshmcalc
--

SELECT pg_catalog.setval('public.webhook_events_id_seq', 1, false);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: calculation_items calculation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculation_items
    ADD CONSTRAINT calculation_items_pkey PRIMARY KEY (id);


--
-- Name: calculations calculations_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT calculations_pkey PRIMARY KEY (id);


--
-- Name: calculations calculations_reference_number_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT calculations_reference_number_key UNIQUE (reference_number);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- Name: countries countries_code_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_code_key UNIQUE (code);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates exchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT exchange_rates_pkey PRIMARY KEY (id);


--
-- Name: expense_templates expense_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.expense_templates
    ADD CONSTRAINT expense_templates_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: freight_quotes freight_quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.freight_quotes
    ADD CONSTRAINT freight_quotes_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: market_data_sources market_data_sources_name_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_data_sources
    ADD CONSTRAINT market_data_sources_name_key UNIQUE (name);


--
-- Name: market_data_sources market_data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_data_sources
    ADD CONSTRAINT market_data_sources_pkey PRIMARY KEY (id);


--
-- Name: market_rate_history market_rate_history_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rate_history
    ADD CONSTRAINT market_rate_history_pkey PRIMARY KEY (id);


--
-- Name: market_rates market_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rates
    ADD CONSTRAINT market_rates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: ports ports_name_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_name_key UNIQUE (name);


--
-- Name: ports ports_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_pkey PRIMARY KEY (id);


--
-- Name: ports ports_unlocode_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_unlocode_key UNIQUE (unlocode);


--
-- Name: product_varieties product_varieties_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: shipping_routes shipping_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.shipping_routes
    ADD CONSTRAINT shipping_routes_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: exchange_rates uk_exchange_rates_pair_date; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.exchange_rates
    ADD CONSTRAINT uk_exchange_rates_pair_date UNIQUE (from_currency, to_currency, effective_date);


--
-- Name: product_varieties uk_product_varieties_product_variety_grade; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT uk_product_varieties_product_variety_grade UNIQUE (product_id, variety, grade);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhook_events webhook_events_event_id_key; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.webhook_events
    ADD CONSTRAINT webhook_events_event_id_key UNIQUE (event_id);


--
-- Name: webhook_events webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.webhook_events
    ADD CONSTRAINT webhook_events_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: idx_calculation_items_calculation; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_calculation_items_calculation ON public.calculation_items USING btree (calculation_id);


--
-- Name: idx_calculations_user_id; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_calculations_user_id ON public.calculations USING btree (user_id);


--
-- Name: idx_freight_quotes_route; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_freight_quotes_route ON public.freight_quotes USING btree (route_id);


--
-- Name: idx_market_rate_history_market_rate; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_market_rate_history_market_rate ON public.market_rate_history USING btree (market_rate_id);


--
-- Name: idx_market_rates_last_updated; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_market_rates_last_updated ON public.market_rates USING btree (last_updated);


--
-- Name: idx_market_rates_product_variety; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_market_rates_product_variety ON public.market_rates USING btree (product_variety_id);


--
-- Name: idx_market_rates_status; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_market_rates_status ON public.market_rates USING btree (status);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_payments_razorpay_order; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_payments_razorpay_order ON public.payments USING btree (razorpay_order_id);


--
-- Name: idx_payments_user_id; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: idx_shipping_routes_origin_dest; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_shipping_routes_origin_dest ON public.shipping_routes USING btree (origin_port_id, destination_port_id);


--
-- Name: idx_subscriptions_user_status; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_subscriptions_user_status ON public.subscriptions USING btree (user_id, status);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: freshmcalc
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: calculation_items calculation_items_calculation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculation_items
    ADD CONSTRAINT calculation_items_calculation_id_fkey FOREIGN KEY (calculation_id) REFERENCES public.calculations(id);


--
-- Name: calculations calculations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.calculations
    ADD CONSTRAINT calculations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cities cities_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: freight_quotes freight_quotes_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.freight_quotes
    ADD CONSTRAINT freight_quotes_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.shipping_routes(id);


--
-- Name: generated_documents generated_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: market_rate_history market_rate_history_market_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rate_history
    ADD CONSTRAINT market_rate_history_market_rate_id_fkey FOREIGN KEY (market_rate_id) REFERENCES public.market_rates(id);


--
-- Name: market_rates market_rates_product_variety_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.market_rates
    ADD CONSTRAINT market_rates_product_variety_id_fkey FOREIGN KEY (product_variety_id) REFERENCES public.product_varieties(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ports ports_city_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- Name: ports ports_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.ports
    ADD CONSTRAINT ports_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: product_varieties product_varieties_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.product_varieties
    ADD CONSTRAINT product_varieties_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: shipping_routes shipping_routes_destination_port_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.shipping_routes
    ADD CONSTRAINT shipping_routes_destination_port_id_fkey FOREIGN KEY (destination_port_id) REFERENCES public.ports(id);


--
-- Name: shipping_routes shipping_routes_origin_port_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.shipping_routes
    ADD CONSTRAINT shipping_routes_origin_port_id_fkey FOREIGN KEY (origin_port_id) REFERENCES public.ports(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: freshmcalc
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ejjActFCxmrF7L0UhUhPZGxMBKwXUYEcTGQSKLqCDaqQ1En6TFlnvHee5ObBTXP

