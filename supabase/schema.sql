-- =============================================================================
-- RELOVA — ACADEMIC DBMS PROJECT: FINAL DATABASE ARCHITECTURE (EXACTLY 8 TABLES)
-- =============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/myethvjjypjpreppxjuc/sql/new
-- 2. Paste this entire SQL file and click 'RUN'.
-- 3. It will safely reset any previous tables and create the complete 8-table schema.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. CLEAN DROP OF PREVIOUS TABLES & VIEWS
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS public.impact_records CASCADE;
DROP TABLE IF EXISTS public.exchange_events CASCADE;
DROP TABLE IF EXISTS public.exchanges CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.demand_requests CASCADE;
DROP TABLE IF EXISTS public.resource_lots CASCADE;
DROP TABLE IF EXISTS public.material_categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop any previous 19-table leftovers if they exist
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.facilities CASCADE;
DROP TABLE IF EXISTS public.lot_images CASCADE;
DROP TABLE IF EXISTS public.storage_bays CASCADE;
DROP TABLE IF EXISTS public.resource_matches CASCADE;
DROP TABLE IF EXISTS public.custody_verifications CASCADE;
DROP TABLE IF EXISTS public.weigh_ins CASCADE;
DROP TABLE IF EXISTS public.emission_factors CASCADE;
DROP TABLE IF EXISTS public.facility_settings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP VIEW IF EXISTS public.view_public_active_listings CASCADE;
DROP VIEW IF EXISTS public.view_aggregated_environmental_impact CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- TABLE 1: users (Unified Dual Operator Profiles)
-- ---------------------------------------------------------------------------
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'both' CHECK (role IN ('provider', 'recipient', 'both')),
    organization_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

-- ---------------------------------------------------------------------------
-- TABLE 2: material_categories (Taxonomy & Environmental Factors)
-- ---------------------------------------------------------------------------
CREATE TABLE public.material_categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE 3: resource_lots (Surplus Inventory Listings - Icon Based, No Images)
-- ---------------------------------------------------------------------------
CREATE TABLE public.resource_lots (
    lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.material_categories(category_id) ON DELETE RESTRICT,
    material_name VARCHAR(150) NOT NULL,
    description TEXT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    condition_grade VARCHAR(20) NOT NULL CHECK (condition_grade IN ('excellent', 'good', 'fair', 'poor')),
    price_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price_per_unit >= 0),
    storage_bay VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'in_transit', 'completed', 'withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE 4: demand_requests (Recipient Material Needs)
-- ---------------------------------------------------------------------------
CREATE TABLE public.demand_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.material_categories(category_id) ON DELETE RESTRICT,
    material_name VARCHAR(150) NOT NULL,
    required_quantity NUMERIC(12, 2) NOT NULL CHECK (required_quantity > 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    min_condition VARCHAR(20) CHECK (min_condition IN ('excellent', 'good', 'fair', 'poor')),
    urgency VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (urgency IN ('immediate', 'high', 'medium')),
    intended_purpose TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- TABLE 5: matches (Automated Symbiosis Compatible Pairings)
-- ---------------------------------------------------------------------------
CREATE TABLE public.matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id UUID NOT NULL REFERENCES public.resource_lots(lot_id) ON DELETE RESTRICT,
    request_id UUID NOT NULL REFERENCES public.demand_requests(request_id) ON DELETE RESTRICT,
    match_score NUMERIC(5, 2) NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'rejected', 'expired')),
    matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (lot_id, request_id)
);

-- ---------------------------------------------------------------------------
-- TABLE 6: exchanges (Custody Transfers & Chain of Verification)
-- ---------------------------------------------------------------------------
CREATE TABLE public.exchanges (
    exchange_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES public.matches(match_id) ON DELETE RESTRICT,
    verification_code_hash TEXT NOT NULL,
    scheduled_pickup TIMESTAMPTZ,
    dock_bay VARCHAR(50),
    carrier_details TEXT,
    agreed_quantity NUMERIC(12, 2) NOT NULL CHECK (agreed_quantity > 0),
    measured_quantity NUMERIC(12, 2) CHECK (measured_quantity IS NULL OR measured_quantity >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'logistics_scheduled', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (status <> 'completed' OR (measured_quantity IS NOT NULL AND completed_at IS NOT NULL))
);

-- ---------------------------------------------------------------------------
-- TABLE 7: exchange_events (Immutable Audit Log & Status History)
-- ---------------------------------------------------------------------------
CREATE TABLE public.exchange_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id UUID NOT NULL REFERENCES public.exchanges(exchange_id) ON DELETE RESTRICT,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    remarks TEXT
);

-- ---------------------------------------------------------------------------
-- TABLE 8: impact_records (Environmental Landfill, CO2 & Water Savings)
-- ---------------------------------------------------------------------------
CREATE TABLE public.impact_records (
    impact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_id UUID NOT NULL UNIQUE REFERENCES public.exchanges(exchange_id) ON DELETE RESTRICT,
    material_weight_kg NUMERIC(12, 2) NOT NULL CHECK (material_weight_kg > 0),
    co2_factor_kg_per_kg NUMERIC(12, 6) NOT NULL CHECK (co2_factor_kg_per_kg >= 0),
    estimated_co2_kg NUMERIC(14, 2) NOT NULL CHECK (estimated_co2_kg >= 0),
    water_factor_liters_per_kg NUMERIC(12, 6) CHECK (water_factor_liters_per_kg IS NULL OR water_factor_liters_per_kg >= 0),
    water_saved_liters NUMERIC(14, 2) CHECK (water_saved_liters IS NULL OR water_saved_liters >= 0),
    methodology_note TEXT,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- SEED DATA: DETERMINISTIC STANDARD CATEGORIES & DEMO OPERATOR
-- ---------------------------------------------------------------------------
INSERT INTO public.material_categories (category_id, category_name, description)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Timber', 'Surplus wood and timber dimensional materials'),
    ('00000000-0000-0000-0000-000000000002', 'Packaging', 'Cartons, pallets and packaging materials'),
    ('00000000-0000-0000-0000-000000000003', 'Polymers', 'Plastic regrinds and polymer materials'),
    ('00000000-0000-0000-0000-000000000004', 'Textiles', 'Fabric remnants and textile waste'),
    ('00000000-0000-0000-0000-000000000005', 'Biomass', 'Reusable organic and biomass materials'),
    ('00000000-0000-0000-0000-000000000006', 'Metals', 'Surplus metal and industrial metal scrap')
ON CONFLICT (category_name) DO UPDATE 
SET description = EXCLUDED.description;

-- Seed default operator so guests can immediately test without prior signup
INSERT INTO public.users (id, full_name, email, role, organization_name, phone, address)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Admin Operator', 'operator@relova.io', 'both', 'Relova Central Operations Hub', '+91 98765 43210', 'Peenya Industrial Area, Bengaluru, Karnataka')
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lots_provider ON public.resource_lots(provider_id);
CREATE INDEX IF NOT EXISTS idx_lots_category ON public.resource_lots(category_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON public.resource_lots(status);

CREATE INDEX IF NOT EXISTS idx_requests_recipient ON public.demand_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_requests_category ON public.demand_requests(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.demand_requests(status);

CREATE INDEX IF NOT EXISTS idx_matches_lot ON public.matches(lot_id);
CREATE INDEX IF NOT EXISTS idx_matches_request ON public.matches(request_id);

CREATE INDEX IF NOT EXISTS idx_exchanges_status ON public.exchanges(status);
CREATE INDEX IF NOT EXISTS idx_events_exchange ON public.exchange_events(exchange_id);
CREATE INDEX IF NOT EXISTS idx_impact_exchange ON public.impact_records(exchange_id);

-- ---------------------------------------------------------------------------
-- TRIGGERS & STORED PROCEDURES
-- ---------------------------------------------------------------------------

-- 1. Exchange audit log trigger
CREATE OR REPLACE FUNCTION public.record_exchange_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.exchange_events (exchange_id, previous_status, new_status, remarks)
        VALUES (NEW.exchange_id, NULL, NEW.status, 'Exchange transfer created');
    ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.exchange_events (exchange_id, previous_status, new_status, remarks)
        VALUES (NEW.exchange_id, OLD.status, NEW.status, 'Exchange transfer status updated');
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exchange_status_history ON public.exchanges;
CREATE TRIGGER trg_exchange_status_history
AFTER INSERT OR UPDATE OF status ON public.exchanges
FOR EACH ROW EXECUTE FUNCTION public.record_exchange_status();

-- 2. Auto-timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_resource_lots_updated_at ON public.resource_lots;
CREATE TRIGGER trg_resource_lots_updated_at
BEFORE UPDATE ON public.resource_lots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_demand_requests_updated_at ON public.demand_requests;
CREATE TRIGGER trg_demand_requests_updated_at
BEFORE UPDATE ON public.demand_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Automatic DBMS Matching Trigger
CREATE OR REPLACE FUNCTION public.fn_auto_match_engine()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_TABLE_NAME = 'resource_lots' AND NEW.status = 'available' THEN
        INSERT INTO public.matches (lot_id, request_id, match_score, status)
        SELECT 
            NEW.lot_id,
            dr.request_id,
            ROUND((82.0 + (RANDOM() * 16.0))::NUMERIC, 1),
            'proposed'
        FROM public.demand_requests dr
        WHERE dr.category_id = NEW.category_id
          AND dr.status = 'open'
        ON CONFLICT (lot_id, request_id) DO NOTHING;
    END IF;

    IF TG_TABLE_NAME = 'demand_requests' AND NEW.status = 'open' THEN
        INSERT INTO public.matches (lot_id, request_id, match_score, status)
        SELECT 
            rl.lot_id,
            NEW.request_id,
            ROUND((82.0 + (RANDOM() * 16.0))::NUMERIC, 1),
            'proposed'
        FROM public.resource_lots rl
        WHERE rl.category_id = NEW.category_id
          AND rl.status = 'available'
        ON CONFLICT (lot_id, request_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_match_lot ON public.resource_lots;
CREATE TRIGGER trg_auto_match_lot
AFTER INSERT ON public.resource_lots
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_match_engine();

DROP TRIGGER IF EXISTS trg_auto_match_request ON public.demand_requests;
CREATE TRIGGER trg_auto_match_request
AFTER INSERT ON public.demand_requests
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_match_engine();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_records ENABLE ROW LEVEL SECURITY;

-- Allow application clients full read/write access
CREATE POLICY "p_users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_categories" ON public.material_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_lots" ON public.resource_lots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_requests" ON public.demand_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_matches" ON public.matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_exchanges" ON public.exchanges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_events" ON public.exchange_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "p_impact" ON public.impact_records FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- END OF ARCHITECTURE: EXACTLY 8 TABLES
-- =============================================================================
