-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00001: Schema Fundamental com PostGIS, Ocorrências, Aeronaves e Perigos
-- ==============================================================================

-- Habilita extensão PostGIS para consultas espaciais e geodésicas
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUMERADOS
CREATE TYPE occurrence_type AS ENUM ('ACCIDENT', 'SERIOUS_INCIDENT', 'INCIDENT', 'AIR_PROXIMITY', 'HAZARD_ALERT');
CREATE TYPE occurrence_severity AS ENUM ('CATASTROPHIC', 'CRITICAL', 'MAJOR', 'MINOR', 'NONE', 'UNKNOWN');
CREATE TYPE verification_status AS ENUM ('PRELIMINARY', 'INVESTIGATION_ONGOING', 'FINAL_REPORT_CONFIRMED', 'UNVERIFIED');
CREATE TYPE visual_classification AS ENUM ('RECENT_ALERT', 'IDENTIFIED_HAZARD', 'HISTORICAL_MEMORY', 'MITIGATED_REMOVED');
CREATE TYPE hazard_type AS ENUM ('TRANSMISSION_LINE', 'COMMUNICATION_TOWER', 'ANTENNA', 'WIND_TURBINE', 'TERRAIN_OBSTACLE', 'BUILDING', 'CABLE_SUSPENDED', 'OTHER');
CREATE TYPE hazard_status AS ENUM ('ACTIVE_EXISTING', 'REMOVED_DEMOLISHED', 'TEMPORARY', 'UNCONFIRMED');

-- 2. OPERADORES E EMPRESAS AÉREAS
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_iso VARCHAR(3),
    icao_code VARCHAR(4),
    iata_code VARCHAR(3),
    operation_type VARCHAR(100), -- Comercial Regular, Táxi Aéreo, Privada, Carga
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AERONAVES ENVOLVIDAS
CREATE TABLE IF NOT EXISTS aircraft (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration VARCHAR(20) NOT NULL, -- Matrícula (ex: PT-XXX, N12345)
    serial_number VARCHAR(100),
    model VARCHAR(150) NOT NULL,       -- ex: B737-800, PA-34 Seneca
    manufacturer VARCHAR(150),        -- ex: Boeing, Embraer, Piper
    aircraft_category VARCHAR(50),    -- Avião, Helicóptero, Planador
    engine_type VARCHAR(50),          -- Pistão, Turboélice, Turbofan
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_aircraft_registration ON aircraft(registration);

-- 4. FONTES OFICIAIS DE DADOS
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'cenipa', 'anac', 'ntsb', 'faa_obstacles', 'icao'
    name VARCHAR(255) NOT NULL,
    official_agency VARCHAR(255) NOT NULL,
    country_iso VARCHAR(3) NOT NULL,
    base_url TEXT,
    license_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OCORRÊNCIAS HISTÓRICAS E GEOGRÁFICAS
CREATE TABLE IF NOT EXISTS occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id),
    source_record_id VARCHAR(150) NOT NULL, -- Número oficial no CENIPA ou NTSB
    occurrence_type occurrence_type NOT NULL,
    severity occurrence_severity DEFAULT 'UNKNOWN',
    visual_tag visual_classification NOT NULL DEFAULT 'HISTORICAL_MEMORY',
    verification_status verification_status DEFAULT 'PRELIMINARY',
    
    occurrence_date DATE NOT NULL,
    occurrence_time TIME,
    
    -- Localização Geográfica (PostGIS)
    location_description TEXT,
    city VARCHAR(150),
    state_province VARCHAR(100),
    country_iso VARCHAR(3) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL, -- WGS84 EPSG:4326
    elevation_ft NUMERIC(8,2),
    
    -- Dados da Aeronave e Voo
    aircraft_id UUID REFERENCES aircraft(id),
    operator_id UUID REFERENCES operators(id),
    flight_phase VARCHAR(100), -- Decolagem, Cruzeiro, Aproximação, Pouso
    flight_nature VARCHAR(100), -- Comercial, Instrução, Privada, Carga
    flight_number VARCHAR(50),
    
    -- Danos e Vítimas
    aircraft_damage VARCHAR(50),
    fatalities_total INT DEFAULT 0,
    serious_injuries_total INT DEFAULT 0,
    minor_injuries_total INT DEFAULT 0,
    uninjured_total INT DEFAULT 0,
    
    -- Narrativa e Relatório Oficial
    summary TEXT,
    investigation_findings TEXT,
    official_report_url TEXT,
    official_report_published_date DATE,
    has_public_figures BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_source_occurrence UNIQUE (source_id, source_record_id)
);

-- Índice Espacial GiST para consultas por raio e rota de altíssima performance
CREATE INDEX idx_occurrences_coordinates ON occurrences USING GIST(coordinates);
CREATE INDEX idx_occurrences_date ON occurrences(occurrence_date DESC);
CREATE INDEX idx_occurrences_visual_tag ON occurrences(visual_tag);

-- 6. PESSOAS PUBLICAMENTE IDENTIFICADAS EM REGISTROS OFICIAIS
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- Piloto, Copiloto, Passageiro, Figura Pública
    public_significance TEXT, -- Notoriedade pública documentada
    source_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_people_occurrence ON people(occurrence_id);

-- 7. OBSTÁCULOS E PERIGOS REAIS
CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id),
    source_hazard_id VARCHAR(150),
    hazard_type hazard_type NOT NULL,
    status hazard_status DEFAULT 'ACTIVE_EXISTING',
    description TEXT,
    
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    height_agl_ft NUMERIC(8,2), -- Altura acima do solo
    height_amsl_ft NUMERIC(8,2), -- Altitude acima do nível médio do mar
    lighting_type VARCHAR(100),
    marking_type VARCHAR(100),
    
    city VARCHAR(150),
    state_province VARCHAR(100),
    country_iso VARCHAR(3) NOT NULL,
    
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hazards_coordinates ON hazards USING GIST(coordinates);
CREATE INDEX idx_hazards_status ON hazards(status);

-- 8. CONSULTAS PRÉ-VOO REALIZADAS POR PILOTOS (CACHE & AUDITORIA)
CREATE TABLE IF NOT EXISTS route_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Opcional caso consulta anônima pública
    origin_icao VARCHAR(4),
    origin_name VARCHAR(150),
    destination_icao VARCHAR(4),
    destination_name VARCHAR(150),
    corridor_buffer_km NUMERIC(6,2) DEFAULT 40.0, -- Corredor lateral em km
    route_geometry GEOMETRY(LineString, 4326),
    occurrences_found INT DEFAULT 0,
    hazards_found INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_route_queries_geometry ON route_queries USING GIST(route_geometry);

-- 9. FUNÇÃO POSTGIS: BUSCA DE MEMÓRIA EM CORREDOR DE ROTA (PRE-FLIGHT INTELLIGENCE)
CREATE OR REPLACE FUNCTION search_route_memory(
    origin_lat FLOAT,
    origin_lon FLOAT,
    dest_lat FLOAT,
    dest_lon FLOAT,
    corridor_km FLOAT DEFAULT 40.0
)
RETURNS TABLE (
    occurrence_id UUID,
    occurrence_date DATE,
    source_record VARCHAR,
    occurrence_type occurrence_type,
    visual_tag visual_classification,
    aircraft_model VARCHAR,
    aircraft_reg VARCHAR,
    location_desc TEXT,
    lat FLOAT,
    lon FLOAT,
    dist_to_route_km FLOAT,
    fatalities INT,
    summary TEXT
) AS $$
DECLARE
    route_line GEOMETRY;
BEGIN
    -- Constrói a linha Great Circle / Linha Reta entre origem e destino
    route_line := ST_SetSRID(ST_MakeLine(ST_MakePoint(origin_lon, origin_lat), ST_MakePoint(dest_lon, dest_lat)), 4326);

    RETURN QUERY
    SELECT 
        o.id AS occurrence_id,
        o.occurrence_date,
        o.source_record_id AS source_record,
        o.occurrence_type,
        o.visual_tag,
        a.model AS aircraft_model,
        a.registration AS aircraft_reg,
        o.location_description AS location_desc,
        ST_Y(o.coordinates::geometry) AS lat,
        ST_X(o.coordinates::geometry) AS lon,
        (ST_Distance(o.coordinates::geography, route_line::geography) / 1000.0)::FLOAT AS dist_to_route_km,
        o.fatalities_total AS fatalities,
        o.summary
    FROM occurrences o
    LEFT JOIN aircraft a ON o.aircraft_id = a.id
    WHERE ST_DWithin(o.coordinates::geography, route_line::geography, corridor_km * 1000.0)
    ORDER BY dist_to_route_km ASC, o.occurrence_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00002: Ingestion Tracking, Deduplication, Audit & Route Intelligence
-- ==============================================================================

-- 1. TABELA DE AUDITORIA DE SINCRONIZAÇÃO E JOBS DE IMPORTAÇÃO
CREATE TABLE IF NOT EXISTS source_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_slug VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'RUNNING', -- 'RUNNING', 'COMPLETED', 'FAILED'
    records_received INT DEFAULT 0,
    records_inserted INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_skipped INT DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HISTÓRICO DE AUDITORIA E MUDANÇAS DE ESTADO DAS OCORRÊNCIAS
CREATE TABLE IF NOT EXISTS occurrence_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
    changed_by UUID, -- ID do administrador ou 'SYSTEM_INGEST'
    previous_status verification_status,
    new_status verification_status,
    previous_visual_tag visual_classification,
    new_visual_tag visual_classification,
    justification TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE AEROPORTOS / AERÓDROMOS OFICIAIS MUNDIAIS
CREATE TABLE IF NOT EXISTS airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ident VARCHAR(20) UNIQUE NOT NULL, -- ICAO ou código local
    icao VARCHAR(4),
    iata VARCHAR(3),
    name VARCHAR(255) NOT NULL,
    airport_type VARCHAR(50),
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    elevation_ft NUMERIC(8,2),
    country_iso VARCHAR(3) NOT NULL,
    municipality VARCHAR(150),
    is_official_ais BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_airports_coordinates ON airports USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_airports_icao ON airports(icao);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata);

-- 4. FUNÇÃO DE DEDUPLICAÇÃO & UPSERT ATÔMICO DE OCORRÊNCIAS
CREATE OR REPLACE FUNCTION upsert_occurrence_record(
    p_source_slug VARCHAR,
    p_source_record_id VARCHAR,
    p_occurrence_type occurrence_type,
    p_visual_tag visual_classification,
    p_verification_status verification_status,
    p_occurrence_date DATE,
    p_occurrence_time TIME,
    p_lat FLOAT,
    p_lon FLOAT,
    p_country_iso VARCHAR,
    p_city VARCHAR,
    p_state VARCHAR,
    p_summary TEXT,
    p_aircraft_reg VARCHAR,
    p_aircraft_model VARCHAR,
    p_aircraft_manufacturer VARCHAR,
    p_fatalities INT
)
RETURNS UUID AS $$
DECLARE
    v_source_id UUID;
    v_aircraft_id UUID;
    v_occurrence_id UUID;
BEGIN
    -- Busca ID da fonte oficial
    SELECT id INTO v_source_id FROM sources WHERE slug = p_source_slug;
    IF v_source_id IS NULL THEN
        RAISE EXCEPTION 'Fonte não cadastrada: %', p_source_slug;
    END IF;

    -- Upsert da aeronave
    IF p_aircraft_reg IS NOT NULL AND p_aircraft_reg != '' AND p_aircraft_reg != 'N/A' THEN
        INSERT INTO aircraft (registration, model, manufacturer)
        VALUES (p_aircraft_reg, COALESCE(p_aircraft_model, 'Desconhecido'), p_aircraft_manufacturer)
        ON CONFLICT (registration) DO UPDATE
        SET model = EXCLUDED.model,
            manufacturer = COALESCE(EXCLUDED.manufacturer, aircraft.manufacturer)
        RETURNING id INTO v_aircraft_id;
    END IF;

    -- Upsert da ocorrência com deduplicação atômica pela chave (source_id, source_record_id)
    INSERT INTO occurrences (
        source_id,
        source_record_id,
        occurrence_type,
        visual_tag,
        verification_status,
        occurrence_date,
        occurrence_time,
        coordinates,
        country_iso,
        city,
        state_province,
        summary,
        aircraft_id,
        fatalities_total,
        updated_at
    )
    VALUES (
        v_source_id,
        p_source_record_id,
        p_occurrence_type,
        p_visual_tag,
        p_verification_status,
        p_occurrence_date,
        p_occurrence_time,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326),
        p_country_iso,
        p_city,
        p_state,
        p_summary,
        v_aircraft_id,
        COALESCE(p_fatalities, 0),
        NOW()
    )
    ON CONFLICT (source_id, source_record_id) DO UPDATE
    SET visual_tag = EXCLUDED.visual_tag,
        verification_status = EXCLUDED.verification_status,
        coordinates = EXCLUDED.coordinates,
        summary = EXCLUDED.summary,
        fatalities_total = EXCLUDED.fatalities_total,
        updated_at = NOW()
    RETURNING id INTO v_occurrence_id;

    RETURN v_occurrence_id;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00003: Trigger de Auditoria Automática & Row Level Security (RLS)
-- ==============================================================================

-- 1. TRIGGER AUTOMÁTICO DE AUDITORIA DE HISTÓRICO
-- Garante que QUALQUER alteração no banco (seja via ingestão, painel ou SQL direto)
-- seja registrada obrigatoriamente na tabela occurrence_history
CREATE OR REPLACE FUNCTION audit_occurrence_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.visual_tag IS DISTINCT FROM NEW.visual_tag) OR 
       (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
        INSERT INTO occurrence_history (
            occurrence_id,
            changed_by,
            previous_status,
            new_status,
            previous_visual_tag,
            new_visual_tag,
            justification
        )
        VALUES (
            NEW.id,
            auth.uid(),
            OLD.verification_status,
            NEW.verification_status,
            OLD.visual_tag,
            NEW.visual_tag,
            'Atualização automática registrada via trigger audit_occurrence_changes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_occurrence ON occurrences;
CREATE TRIGGER trg_audit_occurrence
AFTER UPDATE ON occurrences
FOR EACH ROW
EXECUTE FUNCTION audit_occurrence_changes();

-- 2. HABILITAÇÃO E POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE occurrence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_import_jobs ENABLE ROW LEVEL SECURITY;

-- Consultas Públicas: Qualquer usuário ou piloto pode ler dados oficiais
CREATE POLICY "Public Read Occurrences" ON occurrences FOR SELECT USING (true);
CREATE POLICY "Public Read Aircraft" ON aircraft FOR SELECT USING (true);
CREATE POLICY "Public Read Hazards" ON hazards FOR SELECT USING (true);
CREATE POLICY "Public Read Airports" ON airports FOR SELECT USING (true);
CREATE POLICY "Public Read Sources" ON sources FOR SELECT USING (true);

-- Modificações e Auditoria: Somente usuários autenticados com role 'admin' ou Service Role
CREATE POLICY "Admin Modify Occurrences" ON occurrences 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Read History" ON occurrence_history 
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Read Import Jobs" ON source_import_jobs 
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00004: Supabase Cron Scheduling & Automation Pipeline
-- ==============================================================================

-- Habilita extensão pg_cron e pg_net para disparo de Webhooks / Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. CONFIGURAÇÃO DE FREQUÊNCIA DE SINCRONIZAÇÃO POR FONTE OFICIAL

-- ANAC Brasil: Atualização Diária às 03:00 UTC (00:00 Brasília)
-- Cron: 0 3 * * *
SELECT cron.schedule(
    'sync-anac-daily',
    '0 3 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_functions_url', true) || '/ingest-anac',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', current_setting('app.settings.cron_secret', true)
        )
    );
    $$
);

-- OurAirports / AIS: Atualização Semanal aos domingos às 04:00 UTC
-- Cron: 0 4 * * 0
SELECT cron.schedule(
    'sync-ourairports-weekly',
    '0 4 * * 0',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_functions_url', true) || '/ingest-ourairports',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', current_setting('app.settings.cron_secret', true)
        )
    );
    $$
);

-- 2. TABELA DE MONITORAMENTO DE SAÚDE DAS FONTES (OBSERVABILIDADE)
CREATE TABLE IF NOT EXISTS source_health_metrics (
    source_slug VARCHAR(50) PRIMARY KEY,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INT DEFAULT 0,
    average_processing_time_ms INT,
    last_error_message TEXT,
    is_paused BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semente inicial de observabilidade
INSERT INTO source_health_metrics (source_slug) VALUES 
('anac'),
('cenipa'),
('ntsb'),
('faa_obstacles'),
('ourairports')
ON CONFLICT (source_slug) DO NOTHING;

-- ==============================================================================
-- MGA: Memória Geográfica da Aviação
-- Migration 00005: Canonical Occurrence Identity & Cross-Source Reconciliation
-- ==============================================================================

-- 1. ADICIONA COLUNAS DE IDENTIDADE CANÔNICA E CHAVE SIPAER
ALTER TABLE occurrences 
ADD COLUMN IF NOT EXISTS canonical_id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS sipaer_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_primary_record BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_occurrences_sipaer_code ON occurrences(sipaer_code);
CREATE INDEX IF NOT EXISTS idx_occurrences_canonical_id ON occurrences(canonical_id);

-- 2. TABELA DE PROVENIÊNCIA E CORRELAÇÃO DE FONTES MÚLTIPLAS
CREATE TABLE IF NOT EXISTS occurrence_source_reconciliation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_id UUID NOT NULL,
    source_slug VARCHAR(50) NOT NULL,
    source_record_id VARCHAR(150) NOT NULL,
    reconciliation_confidence NUMERIC(4,3) DEFAULT 1.000, -- 1.000 = correspondência exata de código
    match_criteria VARCHAR(100) NOT NULL, -- 'EXACT_SIPAER_CODE', 'REGISTRATION_DATE_EXACT', 'MANUAL_AUDIT'
    raw_payload_snippet JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_source_record UNIQUE (source_slug, source_record_id)
);

-- 3. FUNÇÃO DE RECONCILIAÇÃO ANAC x CENIPA
-- Quando a ANAC ou CENIPA importam uma ocorrência, se ambas possuírem o mesmo código
-- oficial SIPAER ou mesma matrícula + data exata, elas compartilham o mesmo canonical_id
CREATE OR REPLACE FUNCTION reconcile_aviation_occurrence(
    p_source_slug VARCHAR,
    p_source_record_id VARCHAR,
    p_sipaer_code VARCHAR,
    p_aircraft_reg VARCHAR,
    p_occurrence_date DATE,
    p_new_occurrence_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_existing_canonical_id UUID;
    v_target_canonical_id UUID;
BEGIN
    -- Critério 1: Busca pelo código SIPAER idêntico já cadastrado por outra fonte
    IF p_sipaer_code IS NOT NULL AND p_sipaer_code != '' THEN
        SELECT canonical_id INTO v_existing_canonical_id
        FROM occurrences
        WHERE sipaer_code = p_sipaer_code AND id != p_new_occurrence_id
        LIMIT 1;
    END IF;

    -- Critério 2: Se não achou por código SIPAER, busca por mesma Matrícula + Mesma Data exata
    IF v_existing_canonical_id IS NULL AND p_aircraft_reg IS NOT NULL AND p_aircraft_reg != 'N/A' THEN
        SELECT o.canonical_id INTO v_existing_canonical_id
        FROM occurrences o
        JOIN aircraft a ON o.aircraft_id = a.id
        WHERE a.registration = p_aircraft_reg 
          AND o.occurrence_date = p_occurrence_date 
          AND o.id != p_new_occurrence_id
        LIMIT 1;
    END IF;

    -- Se já existe um registro canônico unificado
    IF v_existing_canonical_id IS NOT NULL THEN
        v_target_canonical_id := v_existing_canonical_id;
        -- Marca este novo registro como fonte secundária enriquecedora
        UPDATE occurrences 
        SET canonical_id = v_target_canonical_id, 
            is_primary_record = FALSE,
            sipaer_code = COALESCE(sipaer_code, p_sipaer_code)
        WHERE id = p_new_occurrence_id;
        
        -- Registra correlação na tabela de reconciliação
        INSERT INTO occurrence_source_reconciliation (
            canonical_id,
            source_slug,
            source_record_id,
            reconciliation_confidence,
            match_criteria
        ) VALUES (
            v_target_canonical_id,
            p_source_slug,
            p_source_record_id,
            1.000,
            CASE WHEN p_sipaer_code IS NOT NULL THEN 'EXACT_SIPAER_CODE' ELSE 'REGISTRATION_DATE_EXACT' END
        ) ON CONFLICT (source_slug, source_record_id) DO NOTHING;
    ELSE
        -- Primeiro registro detectado: define seu próprio canonical_id
        SELECT canonical_id INTO v_target_canonical_id FROM occurrences WHERE id = p_new_occurrence_id;
        
        INSERT INTO occurrence_source_reconciliation (
            canonical_id,
            source_slug,
            source_record_id,
            reconciliation_confidence,
            match_criteria
        ) VALUES (
            v_target_canonical_id,
            p_source_slug,
            p_source_record_id,
            1.000,
            'CANONICAL_PRIMARY'
        ) ON CONFLICT (source_slug, source_record_id) DO NOTHING;
    END IF;

    RETURN v_target_canonical_id;
END;
$$ LANGUAGE plpgsql;

